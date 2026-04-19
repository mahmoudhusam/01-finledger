import { User } from '@/database/entities/user.entity';
import { CreateUserDto } from '@/users/dto/create-users.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  // Implement authentication logic here
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  }

  private async validatePassword(password: string, hashPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashPassword);
    return isValid;
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

      return user;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
