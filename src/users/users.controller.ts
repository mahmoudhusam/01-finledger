import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-users.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getUserById(@Param('id') id: number, @GetUser() user: { userId: number; role: string }) {
    if (user.userId !== id && user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: CreateUserDto,
    @GetUser() user: { userId: number; role: string },
  ) {
    if (user.userId !== id && user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return this.usersService.updateUser(id, updateUserDto);
  }
}
