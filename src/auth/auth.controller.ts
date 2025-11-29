import { Controller, Get, Req, UseGuards, Post, Body, UnauthorizedException, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return;
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiOkResponse({ description: 'OAuth login result with nextStep' })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    console.log('OAuth callback received');
    const profile = req.user as {
      provider: 'google';
      providerId: string;
      email?: string | null;
      name?: string | null;
      avatar?: string | null;
      accessToken?: string | null;
    };
    console.log('Profile:', profile);
    
    const result = await this.authService.oauthLogin(profile);
    console.log('OAuth result:', result);
    
    // Redirect to frontend with tokens as URL parameters
    const frontendUrl = 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/success?` +
      `accessToken=${encodeURIComponent(result.accessToken)}&` +
      `refreshToken=${encodeURIComponent(result.refreshToken)}&` +
      `accessExpires=${encodeURIComponent(result.accessExpires.toString())}&` +
      `refreshExpires=${encodeURIComponent(result.refreshExpires.toString())}&` +
      `nextStep=${encodeURIComponent(result.nextStep)}`;
    
    console.log('Redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiOkResponse({ description: 'New access token' })
  async refresh(@Body() body: { refreshToken: string }, @Res({ passthrough: true }) res: Response) {
    const { accessToken, expiresAt } = await this.authService.refreshAccessToken(body.refreshToken);
    const maxAge = (expiresAt - Math.floor(Date.now() / 1000)) * 1000;
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge,
    });
    return { accessToken, expiresAt };
  }
}

