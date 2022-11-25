import { ModuleMetadata, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { DefaultErrorFilter } from '../error/error.filter';
import { prismaMock } from './getMockedPrismaClient';

export const getTestingApp = async (metadata: ModuleMetadata) => {
  const module = await Test.createTestingModule(metadata)
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new DefaultErrorFilter());

  return {
    module,
    app,
  };
};

export const getIntegrationTestingModule = async (metadata: ModuleMetadata) => {
  return await Test.createTestingModule(metadata).compile();
};
