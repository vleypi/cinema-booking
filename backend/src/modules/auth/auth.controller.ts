import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiNoContentResponse, ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import type { EnvironmentVariables } from '@/config/environment.js';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_MS, AUTH_COOKIE_NAMES } from '@/modules/auth/auth.constant.js';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto.js';
import { LoginDto } from '@/modules/auth/dto/login.dto.js';
import { SessionDto, StaffProfileDto } from '@/modules/auth/dto/staff-profile.dto.js';
import { CurrentStaff, Auth } from '@/modules/auth/auth.decorator.js';
import { type IAuthTokens, AuthService } from '@/modules/auth/auth.service.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  readonly #cookieOptions: CookieOptions;

  constructor(
    private readonly auth: AuthService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.#cookieOptions = { httpOnly: true, secure: config.get('COOKIE_SECURE', { infer: true }), sameSite: 'lax', path: '/' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StaffProfileDto })
  @ApiTooManyRequestsResponse()
  async login(@Body() { login, password }: LoginDto, @Res({ passthrough: true }) response: Response): Promise<StaffProfileDto> {
    const { staff, tokens } = await this.auth.login(login, password);
    this.#setCookies(response, tokens);

    return this.auth.getProfile(staff);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    try {
      const { tokens } = await this.auth.refresh(request.cookies?.[AUTH_COOKIE_NAMES.refresh]);
      this.#setCookies(response, tokens);
    } catch (error) {
      this.#clearCookies(response);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.auth.logout(request.cookies?.[AUTH_COOKIE_NAMES.refresh]);
    this.#clearCookies(response);
  }

  @Get('session')
  @Auth()
  @ApiOkResponse({ type: SessionDto })
  checkSession(): SessionDto {
    return { authenticated: true };
  }

  @Get('me')
  @Auth()
  @ApiOkResponse({ type: StaffProfileDto })
  me(@CurrentStaff() staff: StaffUser): Promise<StaffProfileDto> {
    return this.auth.getProfile(staff);
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiNoContentResponse()
  changePassword(@CurrentStaff() staff: StaffUser, @Body() { currentPassword, newPassword }: ChangePasswordDto): Promise<void> {
    return this.auth.changePassword(staff.id, currentPassword, newPassword);
  }

  #setCookies(response: Response, { accessToken, refreshToken }: IAuthTokens): void {
    response.cookie(AUTH_COOKIE_NAMES.access, accessToken, { ...this.#cookieOptions, maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000 });
    response.cookie(AUTH_COOKIE_NAMES.refresh, refreshToken, { ...this.#cookieOptions, maxAge: REFRESH_TOKEN_TTL_MS });
  }

  #clearCookies(response: Response): void {
    response.clearCookie(AUTH_COOKIE_NAMES.access, this.#cookieOptions);
    response.clearCookie(AUTH_COOKIE_NAMES.refresh, this.#cookieOptions);
  }
}
