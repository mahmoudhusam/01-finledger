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
    return await bcrypt.hash(password, 10);
  }

  private async validatePassword(password: string, hashPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  private generateAccessToken(userId: number, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  private generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  async refresh(refreshToken: string) {
    //Engineering decision: refresh tokens are storage
    //current: DB (simple for MVP)
    //Better for scale: Redis (O(1) lookups, automatic TTL expiry)
    //Migrate when: >10k DAU or if token refresh becomes a bottleneck
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersService.getUserById(payload.sub);
      if (!user?.refresh_token_hash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refresh_token_hash);

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newRefreshToken = this.generateRefreshToken(user.userId);
      const hashedRefreshToken = await this.hashPassword(newRefreshToken);
      await this.usersService.updateUser(user.userId, { refresh_token_hash: hashedRefreshToken });

      return {
        accessToken: this.generateAccessToken(user.userId, user.email, user.role),
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
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
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(userId: number) {
    await this.usersService.updateUser(userId, { refresh_token_hash: null });
    return { message: 'Logged out successfully' };
  }
}
