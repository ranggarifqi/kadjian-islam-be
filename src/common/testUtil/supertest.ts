import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class MySupertest {
  constructor(private server: INestApplication, private baseUrl: string) {}

  post = async (url: string, options: { jwt?: string; payload?: any } = {}) => {
    const { jwt, payload } = options;

    const result = request(this.server.getHttpServer()).post(
      `${this.baseUrl}${url}`,
    );

    if (jwt) {
      result.set('Authorization', `bearer ${jwt}`);
    }

    return result.send(payload);
  };
}
