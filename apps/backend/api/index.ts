import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppModule } from '../src/app.module.js';

const expressApp = express();

// Reaproveita a inicializacao do Nest entre invocacoes (otimizacao de cold start).
let cachedAppPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { cors: true },
  );
  await app.init();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!cachedAppPromise) {
    cachedAppPromise = bootstrap();
  }

  await cachedAppPromise;
  expressApp(req, res);
}
