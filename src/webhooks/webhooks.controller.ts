import { Controller, Post, Body, Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDepositDto } from './dto/create-webhook-deposit.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('deposit')
  async processDeposit(
    @Body() createWebhookDepositDto: CreateWebhookDepositDto,
    @Headers('x-webhook-signature') signature: string | undefined,
  ) {
    return await this.webhooksService.processDeposit(createWebhookDepositDto, signature);
  }
}
