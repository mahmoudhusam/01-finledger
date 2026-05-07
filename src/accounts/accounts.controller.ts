import {
  Controller,
  Post,
  Get,
  Patch,
  UseGuards,
  Body,
  Param,
  Query,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
      if (result.code === 'CONFLICT') {
        throw new ConflictException(result.error);
      }
      throw new InternalServerErrorException(result.error);
    }
    return result.data;
  }

  @ApiOperation({ summary: 'List all accounts' })
  @ApiResponse({ status: 200, description: 'The accounts have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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

  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'The account has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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

  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
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
