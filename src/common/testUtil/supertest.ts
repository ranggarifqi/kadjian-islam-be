import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class MySupertest {
  constructor(private server: INestApplication, private baseUrl: string) {}

  post = async <T = any>(
    url: string,
    options: { jwt?: string; payload?: T } = {},
  ) => {
    const { jwt, payload } = options;

    const result = request(this.server.getHttpServer()).post(
      `${this.baseUrl}${url}`,
    );

    if (jwt) {
      result.set('Authorization', `bearer ${jwt}`);
    }

    return result.send(payload as any);
  };

  patch = async <T = any>(
    url: string,
    options: { jwt?: string; payload?: T } = {},
  ) => {
    const { jwt, payload } = options;

    const result = request(this.server.getHttpServer()).patch(
      `${this.baseUrl}${url}`,
    );

    if (jwt) {
      result.set('Authorization', `bearer ${jwt}`);
    }

    return result.send(payload as any);
  };
}
