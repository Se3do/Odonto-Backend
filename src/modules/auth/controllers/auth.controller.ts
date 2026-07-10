import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('admin/login')
  adminLogin(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.adminLogin(loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  async logout(@CurrentUser('sub') userId: string): Promise<void> {
    await this.authService.logout(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  me(@CurrentUser('sub') userId: string): Promise<UserResponseDto> {
    return this.authService.me(userId);
  }
}
