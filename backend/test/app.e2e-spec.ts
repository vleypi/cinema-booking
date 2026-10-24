import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API_PREFIX } from '@/app.setup.js';
import { VALIDATION_FAILED_MESSAGE } from '@/common/validation/validation-errors.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { VALIDATION_PROBE_PATH, ValidationProbeController } from '@test/support/validation-probe.controller.js';

const PROBE_URL = `/${API_PREFIX}/${VALIDATION_PROBE_PATH}`;
const VALID_PROBE = { name: 'Большой', items: [{ count: 2 }] };

describe('App', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp([ValidationProbeController]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers the health check under the api prefix', async () => {
    await request(app.getHttpServer()).get(`/${API_PREFIX}/health`).expect(200, { status: 'ok' });
  });

  it('returns 404 in the common error format for an unknown route', async () => {
    const response = await request(app.getHttpServer()).get(`/${API_PREFIX}/unknown`).expect(404);

    expect(response.body).toEqual({ statusCode: 404, message: expect.any(String) });
  });

  it('accepts a valid body and transforms it to the dto', async () => {
    await request(app.getHttpServer()).post(PROBE_URL).send(VALID_PROBE).expect(201, VALID_PROBE);
  });

  it('returns 400 with errors for every invalid field', async () => {
    const response = await request(app.getHttpServer()).post(PROBE_URL).send({ name: '', items: [{ count: 0 }] }).expect(400);

    expect(response.body).toMatchObject({ statusCode: 400, message: VALIDATION_FAILED_MESSAGE });
    expect(Object.keys(response.body.errors)).toEqual(['name', 'items.0.count']);
  });

  it('rejects unknown fields instead of silently dropping them', async () => {
    const response = await request(app.getHttpServer()).post(PROBE_URL).send({ ...VALID_PROBE, isAdmin: true }).expect(400);

    expect(response.body.errors).toHaveProperty('isAdmin');
  });
});
