jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn().mockResolvedValue('hashed') }));

import { Test } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(service.login('test@example.com', 'password')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    const user = { id: 1, email: 'test@example.com', password: 'any-string' };
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    mockUsersService.findByEmail.mockResolvedValue(user);
    mockJwtService.sign.mockReturnValue('mocked-token');

    await expect(service.login('test@example.com', 'wrong-password')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return access token on login', async () => {
    const user = { id: 1, email: 'test@example.com', password: 'any-string' };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockUsersService.findByEmail.mockResolvedValue(user);
    mockJwtService.sign.mockReturnValue('mocked-token');

    const result = await service.login('test@example.com', 'correct-password');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('should throw UnauthorizedException when refresh token hash does not match', async () => {
    mockJwtService.verify.mockReturnValue({ sub: 1 });
    mockUsersService.getUserById.mockResolvedValue({
      userId: 1,
      refresh_token_hash: 'some-hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.refresh('fake-token')).rejects.toThrow(UnauthorizedException);
  });

  it('should set refresh_token_hash to null on logout', async () => {
    await service.logout(1);

    expect(mockUsersService.updateUser).toHaveBeenCalledWith(1, { refresh_token_hash: null });
  });
});
