import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MoreThan, Not, IsNull } from 'typeorm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = request.headers['authorization']?.replace('Bearer ', '');

    // If no token, block
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      // Verify token
      const decoded = this.jwtService.verify(token, {secret: this.configService.get<string>('JWT_SECRET')});
      if (decoded.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Attach user to request
      request.user = { id: decoded.sub, email: decoded.email };
      this.logger.log("request.user", request.user);
      return true;
    } catch (e: any) {
      this.logger.error("Token verification failed", e.message);
      
      // If token expired, try to refresh
      if (e.name === 'TokenExpiredError') {
        const decoded = this.jwtService.decode(token);
        if (decoded && typeof decoded === 'object' && decoded.sub) {
          // Find account with valid refresh token for this user
          const account = await this.accounts.findOne({
            where: {
              userId: decoded.sub as string,
              refresh_token: Not(IsNull()),
              refresh_token_expires_at: MoreThan(Math.floor(Date.now() / 1000)),
            },
            relations: ['user'],
          });
          
          if (account && account.refresh_token) {
            try {
              const { accessToken } = await this.authService.refreshAccessToken(account.refresh_token);
              
              // Set new token in response header
              response.setHeader('X-New-Access-Token', accessToken);
              
              // Attach user to request
              request.user = { id: account.user.id, email: account.user.email };
              this.logger.log("Token refreshed for user", account.user.id);
              return true;
            } catch (refreshError) {
              this.logger.error("Refresh token failed", refreshError.message);
            }
          }
        }
      }
      
      throw new UnauthorizedException('Not authenticated');
    }
  }
}
