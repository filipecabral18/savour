FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies including workspace dependencies
RUN pnpm install --filter frontend...

# Copy the rest of the application
COPY . .

# Build Next.js application
RUN pnpm --filter frontend build

EXPOSE 3000

CMD ["pnpm", "--filter", "frontend", "run", "dev"]
