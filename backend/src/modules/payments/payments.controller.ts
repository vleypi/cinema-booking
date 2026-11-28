import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { createValidationException } from '@/common/validation/validation-errors.js';
import { PaymentDto, WebhookAckDto } from '@/modules/payments/dto/payment.dto.js';
import { YooKassaWebhookDto } from '@/modules/payments/dto/yookassa-webhook.dto.js';
import { PaymentsService } from '@/modules/payments/payments.service.js';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('orders/:orderId/payments')
  @ApiCreatedResponse({ type: PaymentDto, description: 'Созданный платеж в ЮKassa со ссылкой на оплату' })
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  createOnlinePayment(@Param('orderId', ParseIdPipe) orderId: string): Promise<PaymentDto> {
    return this.payments.createOnlinePayment(orderId);
  }

  @Post('payments/yookassa/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebhookAckDto })
  @ApiBadRequestResponse()
  handleYooKassaWebhook(@Body() body: unknown): Promise<WebhookAckDto> {
    const dto = plainToInstance(YooKassaWebhookDto, body);
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: false });
    if (errors.length > 0) {
      throw createValidationException(errors);
    }

    return this.payments.handleYooKassaWebhook(dto);
  }
}
