import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';

@Injectable()
export class UsersService {
  createUser(createUserDto: CreateUserDto) {
    return `User ${createUserDto.fullName} created successfully`;
  }

  getUserById(id: number) {
    return `User with ID ${id} retrieved successfully`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser(id: number, _updateUserDto: CreateUserDto) {
    return `User with ID ${id} updated successfully`;
  }
}
