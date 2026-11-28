import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '@/config/environment.js';
import { PAYMENT_CURRENCY, PAYMENT_MESSAGES } from '@/modules/payments/payments.constant.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';

export interface IYooKassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
  captured_at?: string;
  created_at?: string;
  metadata?: Record<string, string>;
}

export interface ICreateYooKassaPaymentParams {
  amountKopecks: number;
  description: string;
  returnUrl: string;
  idempotenceKey: string;
  metadata: Record<string, string>;
}

@Injectable()
export class YooKassaClient {
  readonly #apiUrl: string;
  readonly #shopId: string;
  readonly #secretKey: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.#apiUrl = config.get('YOOKASSA_API_URL', { infer: true }).replace(/\/+$/, '');
    this.#shopId = config.get('YOOKASSA_SHOP_ID', { infer: true });
    this.#secretKey = config.get('YOOKASSA_SECRET_KEY', { infer: true });
  }

  async createPayment(params: ICreateYooKassaPaymentParams): Promise<IYooKassaPaymentResponse> {
    const response = await this.#request('/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': params.idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: formatKopecksToRubles(params.amountKopecks),
          currency: PAYMENT_CURRENCY,
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: params.returnUrl,
        },
        description: params.description,
        metadata: params.metadata,
      }),
    });

    return (await response.json()) as IYooKassaPaymentResponse;
  }

  async getPayment(externalId: string): Promise<IYooKassaPaymentResponse> {
    const response = await this.#request(`/payments/${encodeURIComponent(externalId)}`, {
      method: 'GET',
    });

    return (await response.json()) as IYooKassaPaymentResponse;
  }

  async #request(path: string, init: { method: string; headers?: Record<string, string>; body?: string }): Promise<Response> {
    if (!this.#shopId || !this.#secretKey) {
      throw new ServiceUnavailableException(PAYMENT_MESSAGES.yookassaNotConfigured);
    }

    const credentials = Buffer.from(`${this.#shopId}:${this.#secretKey}`).toString('base64');
    const response = await fetch(`${this.#apiUrl}${path}`, {
      method: init.method,
      body: init.body,
      headers: {
        Authorization: `Basic ${credentials}`,
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(PAYMENT_MESSAGES.yookassaRequestFailed);
    }

    return response;
  }
}
