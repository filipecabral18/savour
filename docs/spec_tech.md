# Especificação Técnica

## Visão Geral Técnica

Este documento define as diretrizes arquiteturais, stack tecnológica e padrões de engenharia para o desenvolvimento da plataforma digital de reservas e gestão de fila. O objetivo principal é guiar a equipe de engenharia (desenvolvedores, DevOps e QA) na construção de um sistema escalável, resiliente e seguro, garantindo a entrega das funcionalidades propostas, especialmente a gestão dinâmica de capacidade e a fila de espera virtual.

---

## Arquitetura de Referência

O sistema será construído utilizando os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**. Essa abordagem garantirá que as regras de negócio complexas, como o cálculo de disponibilidade em tempo real e a prevenção de overbooking, fiquem isoladas de detalhes de infraestrutura e frameworks.

* **Estilo Arquitetural:** Microsserviços modulares (Modular Monolith no MVP) para facilitar o deployment e a manutenibilidade, evoluindo conforme a carga.
* **Componentes Principais:** Aplicação Web (B2C e B2B), API RESTful central e um Worker em background para processamento de filas e notificações assíncronas.
* **Comunicação em Tempo Real:** Utilização de WebSockets (Server-Sent Events ou Socket.io) para atualizar dinamicamente a posição do usuário na fila de espera virtual e o painel da hostess.
* **Serviço de Observabilidade:** Monitoramento centralizado de logs, métricas de performance e rastreamento de erros para garantir a latência máxima de 3 segundos nas notificações.
* **Infraestrutura de Deployment:** Contêineres orquestrados em nuvem pública, garantindo escalabilidade horizontal durante os horários de pico dos estabelecimentos.

---

## Stack Tecnológica

### Frontend

* **Typescript**: Linguagem principal para garantir tipagem estática e segurança no desenvolvimento das interfaces.
* **React**: Biblioteca base para a construção das interfaces do usuário web, tanto para o Cliente Organizador quanto para a Recepcionista.
* **Tailwind**: Framework utilitário de CSS para estilização ágil e responsiva (Mobile-First).

### Backend

* **Typescript**: Linguagem principal para compartilhar tipagens e interfaces com o frontend.
* **Runtime**: Node.js, otimizado para operações de I/O não bloqueantes e alta concorrência.
* **NestJS**: Framework escolhido por sua estrutura modular, injeção de dependências nativa e facilidade de integração com os princípios de Clean Architecture.
* **Persistência**: PostgreSQL. Banco de dados relacional robusto, essencial para aplicar o *pessimistic locking* necessário para evitar *double booking*.
* **ORM**: Prisma, para garantir *type-safety* nas consultas ao banco de dados e facilitar o versionamento do schema.

### Stack de Desenvolvimento

* **IDE**: Visual Studio Code ou Cursor, com extensões padronizadas via `.vscode/extensions.json`.
* **Gerenciamento de pacotes**: `pnpm` para maior velocidade de instalação e eficiência de armazenamento.
* **Ambiente de desenvolvimento local**: **Docker** e Docker Compose para padronizar a execução do banco de dados, Redis (para filas) e a própria aplicação, garantindo paridade entre os ambientes de todos os engenheiros, inclusive em ecossistemas macOS.
* **Infraestrutura como Código (IaC)**: Terraform para provisionamento versionado da infraestrutura na nuvem.
* **Pipeline CI/CD**: GitHub Actions para automação de testes, linting, build de imagens Docker e deploy contínuo.

### Integrações

* **Persistência**: AWS RDS (PostgreSQL) para dados transacionais e Amazon ElastiCache (Redis) para gestão da fila virtual e cache.
* **Deployment**: AWS ECS (Elastic Container Service) ou Vercel (para o frontend no MVP).
* **Segurança (autenticação e autorização)**: Integração com provedor de identidade externo (ex: Supabase Auth ou Clerk) para gestão de usuários B2B e B2C com suporte a OTP via WhatsApp/SMS.
* **Observabilidade**: Datadog ou Sentry para Application Performance Monitoring (APM) e captura de exceções.

---

## Segurança

### Autenticação e Gestão de Sessão
Implementação de JWT (JSON Web Tokens) com tempo de expiração curto e *refresh tokens* armazenados em *HttpOnly cookies* para mitigar ataques XSS. A sessão dos clientes B2C pode ser mantida via "Magic Links" ou OTP (One Time Password) para reduzir atrito no fluxo de reserva.

### Controle de Acesso e Autorização
Adoção de RBAC (Role-Based Access Control). O sistema deve distinguir claramente as permissões entre o `Cliente Organizador` (acessa apenas suas próprias reservas) e a `Recepcionista/Hostess` (acessa as configurações e o salão do seu estabelecimento específico).

### Segurança de Dados e Validação
Validação rigorosa de todos os *inputs* no frontend e backend utilizando bibliotecas como `Zod`. A prevenção contra overbooking será garantida através de transações de banco de dados e controle de concorrência rigoroso na camada de domínio.

#### Criptografia e Proteção de Dados
Dados sensíveis em repouso (PII - Personally Identifiable Information) serão criptografados (AES-256). As senhas dos usuários B2B serão hasheadas usando `bcrypt` ou `Argon2`. Toda a comunicação em trânsito ocorrerá obrigatoriamente via HTTPS/TLS 1.3.

### Segurança da Infraestrutura e Configuração
Princípio do menor privilégio aplicado a todos os serviços e bancos de dados. Uso de AWS Secrets Manager ou HashiCorp Vault para gestão de chaves de API e credenciais, garantindo que nenhum segredo seja comitado no repositório.

### Segurança no Desenvolvimento e Operação (DevSecOps)
Verificação automatizada de vulnerabilidades em dependências (`npm audit` / Snyk) no pipeline de CI/CD. Análise estática de código (SAST) integrada ao SonarQube.

---

## APIs

* **Padrão Arquitetural**: RESTful para operações de CRUD (ex: gestão de estabelecimentos) e WebSockets para o painel de gestão de salão da recepção.
* **Endpoint Principal (Base URL)**: `https://api.dominio.com.br/v1/`
* **Versionamento**: Explicito na URL (`/v1/`, `/v2/`) para garantir retrocompatibilidade.
* **Padrão de Nomenclatura**: Substantivos no plural (ex: `/v1/reservations`, `/v1/waitlists`).
* **Autenticação**: Bearer Token no header `Authorization`.
* **Endpoints Públicos**: `/v1/establishments/{id}/availability` (para o motor de busca do cliente).
* **Endpoints Protegidos**: `/v1/establishments/{id}/waitlist/check-in` (requer *role* de Hostess).

---

## Tenancy

* **Estratégia**: *Single-deployment, Multi-tenant* (SaaS). A aplicação atenderá múltiplos restaurantes simultaneamente.
* **Isolamento**: Isolamento lógico no nível do banco de dados (Row-Level Security ou *Tenant ID* em todas as tabelas transacionais). No MVP, utilizaremos a estratégia de coluna `establishment_id` (Tenant ID) compartilhando o mesmo *schema*.
* **Identificação**: O *tenant* será identificado através do token JWT do usuário autenticado no painel B2B, garantindo que uma hostess não possa acessar a fila de outro restaurante.
* **Migrações**: O processo de migração do banco de dados (via Prisma) aplicará as mudanças em todo o *schema* globalmente.
* **Segurança**: O backend deve implementar filtros automáticos em nível de repositório (no NestJS) para garantir que toda query inclua o `establishment_id` correspondente à sessão ativa.

---

## Diretrizes para Desenvolvimento Assistido por IA

Esta documentação técnica deve servir como o contexto principal (*system prompt*) para ferramentas de geração de código baseadas em IA (como GitHub Copilot, Cursor ou Gemini). A IA deve interpretar este documento para:

1.  **Geração de Estruturas**: Criar o *scaffolding* de módulos, controladores e serviços no NestJS respeitando as camadas de Clean Architecture.
2.  **Validação de Stack**: Sugerir apenas bibliotecas do ecossistema Node.js/React compatíveis com as escolhas (Tailwind, Prisma, Zod).
3.  **Implementação de Regras**: Utilizar as definições do PRD (como a lógica da Fila de Espera Virtual) para gerar a lógica de domínio nas entidades do DDD.
4.  **Criação de Testes**: Produzir testes unitários focados nos Critérios de Aceitação das Funcionalidades Principais descritas no PRD.