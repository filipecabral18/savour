import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Importa o build tsc (dist), nao o fonte .ts: o bundler da Vercel (esbuild) nao
// emite metadados de decorator, o que quebraria a injecao de dependencias do Nest.
// O dist e gerado pelo Build Command (prisma generate && nest build) antes do
// empacotamento da function.
import { AppModule } from '../dist/src/app.module.js';

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
