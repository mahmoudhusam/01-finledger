import { Controller, Post, Body, Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDepositDto } from './dto/create-webhook-deposit.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @ApiOperation({ summary: 'Process a deposit webhook' })
  @ApiResponse({ status: 200, description: 'The deposit has been successfully processed.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('deposit')
  async processDeposit(
    @Body() createWebhookDepositDto: CreateWebhookDepositDto,
    @Headers('x-webhook-signature') signature: string | undefined,
  ) {
    return await this.webhooksService.processDeposit(createWebhookDepositDto, signature);
  }
}
