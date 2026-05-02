import { Controller, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDepositDto } from './dto/create-webhook-deposit.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('deposit')
  async processDeposit(createWebhookDepositDto: CreateWebhookDepositDto) {
    return await this.webhooksService.processDeposit(createWebhookDepositDto);
  }
}
