# Savour

Plataforma de **reservas e fila de espera virtual** para restaurantes. O projeto resolve um problema clássico de operação de salão: distribuir a capacidade de mesas em tempo real, oferecer horários alternativos quando o pedido está lotado e gerenciar uma fila de espera digital — sem o cliente precisar ficar parado na porta segurando uma senha de papel.

O sistema é dividido em dois portais:

- **Portal do cliente (B2C)** — o cliente consulta disponibilidade por data, horário e número de pessoas, confirma a reserva ou entra na fila de espera virtual e acompanha sua posição em tempo real (com aviso sonoro quando a mesa fica pronta).
- **Painel da recepção (Hostess)** — a equipe do restaurante visualiza as reservas do dia, faz check-in/no-show, gerencia a fila de espera e "chama o próximo". Protegido por autenticação (Clerk).

> O cenário de demonstração usa um restaurante fictício, o **Savour Bistro**.

## Stack

| Camada | Tecnologia |
| --- | --- |
| **Frontend** | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Clerk (auth) · lucide-react |
| **Backend** | NestJS 11 · TypeScript · Prisma 7 |
| **Banco de dados** | PostgreSQL 16 |
| **Fila / cache** | Redis 7 (ioredis) |
| **Infra / Dev** | Docker Compose · pnpm workspaces (monorepo) |

### Organização do monorepo

```
savour/
├── apps/
│   ├── frontend/        # Next.js — portal do cliente (/) e painel hostess (/hostess)
│   └── backend/         # NestJS — API REST + Prisma + Redis
├── docker-compose.yml   # Postgres + Redis + backend + frontend
├── pnpm-workspace.yaml
└── .env.example
```

A API do backend é exposta sob o prefixo `v1/establishments`, cobrindo disponibilidade, reservas e fila de espera. Exemplos:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/v1/establishments/:id/availability` | Consulta capacidade disponível para data e nº de pessoas |
| `POST` | `/v1/establishments/:id/reservations` | Cria uma reserva |
| `GET` | `/v1/establishments/:id/alternative-slots` | Sugere horários alternativos quando lotado |
| `POST` | `/v1/establishments/:id/waitlist` | Entra na fila de espera virtual |
| `GET` | `/v1/establishments/:id/waitlist/:entryId` | Acompanha posição e tempo estimado |
| `POST` | `/v1/establishments/:id/waitlist/call-next` | Recepção chama o próximo da fila |

## Como rodar (Docker Compose)

Pré-requisitos: **Docker** e **Docker Compose**.

1. Clone o repositório e crie o arquivo de variáveis de ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis necessárias no `.env`. Para o fluxo completo (incluindo o painel da recepção autenticado) são necessárias as chaves do **Clerk**:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   ```

   As portas e a conexão de banco/Redis já têm valores padrão definidos no `docker-compose.yml`.

3. Suba toda a stack:

   ```bash
   docker compose up
   ```

   Isso provisiona Postgres, Redis, backend (NestJS) e frontend (Next.js) já conectados na mesma rede.

4. Acesse:

   - **Portal do cliente:** http://localhost:3000
   - **Painel da recepção:** http://localhost:3000/hostess
   - **API (backend):** http://localhost:3001

As portas podem ser ajustadas via `FRONTEND_PORT` e `BACKEND_PORT` no `.env`.

## Rodando sem Docker (desenvolvimento local)

Pré-requisitos: **Node.js 20+**, **pnpm**, e instâncias de **PostgreSQL** e **Redis** acessíveis (informe as URLs em `.env`).

```bash
pnpm install          # instala dependências de todo o workspace
pnpm db:migrate       # aplica as migrations do Prisma (backend)
pnpm dev              # sobe frontend e backend em modo de desenvolvimento
```

Scripts úteis na raiz:

| Script | O que faz |
| --- | --- |
| `pnpm dev` | Sobe todos os apps em modo dev |
| `pnpm build` | Build de produção de todos os apps |
| `pnpm db:migrate` | Aplica as migrations do Prisma |
| `pnpm db:generate` | Regenera o Prisma Client |

## Modelo de dados

Duas entidades principais (Prisma):

- **Establishment** — restaurante, com `capacity` (lugares totais) e `turnoverTime` (tempo médio de ocupação da mesa, em minutos).
- **Reservation** — reserva vinculada a um estabelecimento, com data/horário, número de pessoas, dados de contato e `status` (`CONFIRMED`, `CHECKED_IN`, `CANCELLED`, `NO_SHOW`).

A fila de espera virtual é mantida no **Redis** para acompanhamento de posição e tempo de espera em tempo real.

---

Projeto desenvolvido como entrega de pós-graduação.
</content>
</invoke>
