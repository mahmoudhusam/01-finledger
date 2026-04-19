import { User } from '@/database/entities/user.entity';
import { CreateUserDto } from '@/users/dto/create-users.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  }

  private async validatePassword(password: string, hashPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashPassword);
    return isValid;
  }

  private generateAccessToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(userId: number) {
    const payload = { sub: userId };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  async refresh(refreshToken: string, userId: number) {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.sub !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const user = await this.usersService.getUserById(userId);
      if (!user || !user.refresh_token_hash) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const isRefreshTokenValid = await this.validatePassword(
        refreshToken,
        user.refresh_token_hash,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user.userId, user.email, user.role);
      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw our custom errors
      }
      throw new UnauthorizedException('Invalid refresh token'); // Catch JWT errors
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await this.validatePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = this.generateAccessToken(user.userId, user.email, user.role);
      const refreshToken = this.generateRefreshToken(user.userId);

      const hashedRefreshToken = await this.hashPassword(refreshToken);

      await this.usersService.updateUser(user.userId, { refresh_token_hash: hashedRefreshToken });

      return { accessToken, refreshToken };
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(userId: number) {
    await this.usersService.updateUser(userId, { refresh_token_hash: null });
    return { message: 'Logged out successfully' };
  }
}
