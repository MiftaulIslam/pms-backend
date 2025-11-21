import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { Provider } from '../entities/provider.enum';
import { JwtService } from '@nestjs/jwt';
import { MoreThan } from 'typeorm';

type OAuthProfile = {
  provider: "google";
  providerId: string;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
  accessToken?: string | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly jwtService: JwtService,
  ) {}

  private generateTokens(user: User) {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };
    const refreshPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: '3d' });
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    const now = Math.floor(Date.now() / 1000);
    const accessExpires = now + 3 * 24 * 60 * 60; // 3 days
    const refreshExpires = now + 7 * 24 * 60 * 60; // 7 days

    return { accessToken, refreshToken, accessExpires, refreshExpires };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const account = await this.accounts.findOne({
        where: { 
          refresh_token: refreshToken, 
          refresh_token_expires_at: MoreThan(Math.floor(Date.now() / 1000))
        },
        relations: ['user'],
      });
      if (!account) {
        throw new UnauthorizedException('Refresh token invalid or expired');
      }

      const { accessToken, accessExpires } = this.generateTokens(account.user);

      // Update database with new access token and expiry
      account.access_token = accessToken;
      account.access_token_expires_at = accessExpires;
      await this.accounts.save(account);

      this.logger.log(`Refreshed access token for user: ${account.user.id}`);
      return { accessToken, expiresAt: accessExpires };
    } catch (e) {
      this.logger.warn(`Failed to refresh access token: ${e.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async oauthLogin(profile: OAuthProfile) {
    const providerEnum: Provider = this.mapProvider(profile.provider);
    console.log("OAuth profile:", profile);
    this.logger.log(
      `OAuth login attempt for provider: ${profile.provider}, providerId: ${profile.providerId}`
    );

    const existingAccount = await this.accounts.findOne({
      where: { provider: providerEnum, providerAccountId: profile.providerId },
      relations: ['user'],
    });
    console.log("existing account", existingAccount);
    if (existingAccount) {
      this.logger.log(
        `Existing account found for user: ${existingAccount.user.email}`
      );
      const nextStep = existingAccount.user.onboarded
        ? "onboarded"
        : "boarding";
      this.logger.log(`Next step for user: ${nextStep}`);
      this.logger.log(
        `User onboarded: ${existingAccount.user.onboarded}, nextStep: ${nextStep}`
      );
      
      const user = existingAccount.user;
    const { accessToken, refreshToken, accessExpires, refreshExpires } = this.generateTokens(user);

    // Update account with new tokens and expiry
    existingAccount.access_token = accessToken;
    existingAccount.access_token_expires_at = accessExpires;
    existingAccount.refresh_token = refreshToken;
    existingAccount.refresh_token_expires_at = refreshExpires;
    await this.accounts.save(existingAccount);

    return {
      user,
      account: existingAccount,
      nextStep,
      accessToken,
      refreshToken,
      accessExpires,
      refreshExpires,
    };
    }

    // If account doesn't exist, try to link to existing user by email
    let user: User | null = null;
    if (profile.email) {
      user = await this.users.findOne({ where: { email: profile.email } });
      if (user) this.logger.log(`Found existing user by email: ${user.email}`);
    }
    if (!user) {
      this.logger.log(`No existing user found by email, creating new user`);
      // Create new user with account
      const createdUser = this.users.create({
        name: profile.name ?? null,
        email: profile.email ?? null,
        avatar: profile.avatar ?? null,
      });
      await this.users.save(createdUser);

    const { accessToken, refreshToken, accessExpires, refreshExpires } = this.generateTokens(createdUser);

      const account = this.accounts.create({
        provider: providerEnum,
        providerAccountId: profile.providerId,
        access_token: accessToken,
        access_token_expires_at: accessExpires,
        refresh_token: refreshToken,
        refresh_token_expires_at: refreshExpires,
        userId: createdUser.id,
      });
      await this.accounts.save(account);

      this.logger.log(
        `Created user with account: ${createdUser.email}, account ID: ${account.id}`,
      );

      return {
        user: createdUser,
        account,
        nextStep: 'boarding',
        accessToken,
        refreshToken,
        accessExpires,
        refreshExpires,
      };
    }

    // Link new account to existing user
    this.logger.log(`Linking new account to existing user: ${user.email}`);

    const { accessToken, refreshToken, accessExpires, refreshExpires } = this.generateTokens(user);

    const createdAccount = this.accounts.create({
      provider: providerEnum,
      providerAccountId: profile.providerId,
      access_token: accessToken,
      access_token_expires_at: accessExpires,
      refresh_token: refreshToken,
      refresh_token_expires_at: refreshExpires,
      userId: user.id,
    });
    await this.accounts.save(createdAccount);

    const nextStep = user.onboarded ? "onboarded" : "boarding";
    this.logger.log(`Linked account to user: ${user.email}, nextStep: ${nextStep}`);
    return {
      user,
      account: createdAccount,
      nextStep,
      accessToken,
      refreshToken,
      accessExpires,
      refreshExpires,
    };
  }

  private mapProvider(provider: string): Provider {
    switch (provider.toLowerCase()) {
      case "google":
        return Provider.GOOGLE;
      case "github":
        return Provider.GITHUB;
      case "facebook":
        return Provider.FACEBOOK;
      default:
        return Provider.GOOGLE;
    }
  }
}
