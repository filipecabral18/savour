FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies including workspace dependencies
RUN pnpm install --filter backend...

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN cd apps/backend && npx prisma generate

# Build NestJS application
RUN pnpm --filter backend build

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "run", "start:dev"]
