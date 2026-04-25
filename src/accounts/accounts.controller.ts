import {
  Controller,
  Post,
  Get,
  Patch,
  UseGuards,
  Body,
  Param,
  Query,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UpdateAccountDto } from './dto/update-account.dto';

@UseGuards(JwtGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
    @GetUser() user: { userId: number },
  ) {
    const result = await this.accountsService.createAccount(createAccountDto, user.userId);
    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        throw new NotFoundException(result.error);
      }
      throw new InternalServerErrorException(result.error);
    }
    return result.data;
  }

  @Get()
  async listAccounts(
    @Query() params: { limit?: number; cursor?: string },
    @GetUser() user: { userId: number },
  ) {
    const result = await this.accountsService.listAccounts(
      user.userId,
      params.limit,
      params.cursor,
    );
    if (!result.success) {
      throw new InternalServerErrorException(result.error);
    }
    return result.data;
  }

  @Get(':id')
  async getAccountById(@Param('id') id: string, @GetUser() user: { userId: number }) {
    const result = await this.accountsService.getAccountById(parseInt(id), user.userId);
    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        throw new NotFoundException(result.error);
      }
      throw new InternalServerErrorException(result.error);
    }
    return result.data;
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @GetUser() user: { userId: number },
  ) {
    const result = await this.accountsService.updateAccount(
      parseInt(id),
      user.userId,
      updateAccountDto,
    );
    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        throw new NotFoundException(result.error);
      }
      throw new InternalServerErrorException(result.error);
    }
    return result.data;
  }
}
