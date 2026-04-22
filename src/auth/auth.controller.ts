import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtGuard } from '@/common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: RegisterDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtGuard)
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto, @GetUser() user: { userId: number }) {
    return this.authService.refresh(refreshDto.refreshToken, user.userId);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@GetUser() user: { userId: number }) {
    return this.authService.logout(user.userId);
  }
}
