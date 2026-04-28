import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  async transfer(
    @Body() createTransferDto: CreateTransferDto,
    @GetUser() user: { userId: number },
  ) {
    return this.transferService.transfer(createTransferDto, user.userId);
  }

  @Get()
  async listTransfers(
    @Query() params: { limit?: number; cursor?: string },
    @GetUser() user: { userId: number },
  ) {
    return this.transferService.listTransfers(user.userId, params.limit, params.cursor);
  }
  @Get(':id')
  async getTransferById(@Param('id') id: string, @GetUser() user: { userId: number }) {
    return this.transferService.getTransferById(parseInt(id), user.userId);
  }
}
