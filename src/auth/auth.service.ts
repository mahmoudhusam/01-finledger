import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Implement authentication logic here
  constructor(private jwtService: JwtService) {}

  private async hashPassword(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  }

  private async validatePassword(password: string, hashPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashPassword);
    return isValid;
  }
}
