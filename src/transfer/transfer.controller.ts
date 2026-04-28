import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  async transfer(@Body() createTransferDto: CreateTransferDto) {
    return this.transferService.transfer(createTransferDto);
  }

  @Get()
  async listTransfers(@Query() params: { limit?: number; cursor?: string }) {
    return this.transferService.listTransfers(params.limit, params.cursor);
  }
  @Get(':id')
  async getTransferById(@Param('id') id: string) {
    return this.transferService.getTransferById(parseInt(id));
  }
}
