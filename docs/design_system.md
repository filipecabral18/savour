# Design System — Savour

## Visão Geral

Este documento define a linguagem visual da plataforma **Savour** (reservas e fila de espera virtual para restaurantes e bares). Ele serve como fonte de verdade para a construção da interface e deve ser interpretado por ferramentas de geração de código assistidas por IA junto com `docs/spec_ui.md`.

**Princípios de design:**

- **Acolhedor, porém eficiente:** a marca evoca o prazer de uma boa refeição em grupo, mas a interface prioriza agilidade — o cliente resolve a reserva em poucos toques.
- **Mobile-First (B2C):** as telas do Cliente Organizador (INT-001, INT-002, INT-003) são desenhadas primeiro para celular.
- **Densidade operacional (B2B):** o painel da Hostess (INT-004) é otimizado para tablet/desktop, com botões grandes e feedback instantâneo.
- **Clareza acima de decoração:** estados (disponível, fila, mesa pronta) devem ser inequívocos por cor e ícone, nunca apenas por texto.

---

## Identidade da Marca

**Personalidade:** caloroso, confiável, contemporâneo. Inspirado em ambientes gastronômicos — tons terrosos e quentes que remetem a madeira, vinho e luz de fim de tarde, equilibrados por neutros limpos que garantem legibilidade.

---

## Cores

### Paleta primária

| Token         | Hex       | Uso                                                            |
| ------------- | --------- | -------------------------------------------------------------- |
| `primary-50`  | `#FDF4F0` | Fundos suaves, hovers leves                                    |
| `primary-100` | `#FBE4D8` | Backgrounds de destaque                                        |
| `primary-300` | `#EFA98C` | Bordas e estados intermediários                                |
| `primary-500` | `#D9603B` | **Cor principal** — botões primários, links, marca (terracota) |
| `primary-600` | `#BE4E2E` | Hover de botões primários                                      |
| `primary-700` | `#9A3E25` | Pressionado / ênfase forte                                     |

### Paleta secundária (apoio)

| Token           | Hex       | Uso                                                    |
| --------------- | --------- | ------------------------------------------------------ |
| `secondary-500` | `#2E4A47` | Verde-profundo para o painel B2B (Hostess), cabeçalhos |
| `secondary-300` | `#6E8B87` | Ícones e textos secundários no painel                  |

### Cores de estado (semânticas)

| Token         | Hex       | Significado                      |
| ------------- | --------- | -------------------------------- |
| `success-500` | `#2E9E5B` | Mesa pronta / reserva confirmada |
| `warning-500` | `#E0A93B` | Aguardando na fila / atrasado    |
| `danger-500`  | `#D14343` | No-show / cancelamento / erro    |
| `info-500`    | `#3B7DD8` | Mensagens informativas           |

### Neutros

| Token         | Hex       | Uso                              |
| ------------- | --------- | -------------------------------- |
| `neutral-900` | `#1C1A19` | Texto principal                  |
| `neutral-700` | `#44403E` | Texto secundário                 |
| `neutral-500` | `#78716C` | Texto desabilitado / placeholder |
| `neutral-300` | `#D6D3D1` | Bordas e divisores               |
| `neutral-100` | `#F5F4F2` | Fundos de seção                  |
| `neutral-0`   | `#FFFFFF` | Fundo base / cards               |

**Acessibilidade:** todos os pares texto/fundo devem manter contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande). Estados nunca dependem só de cor — sempre acompanhados de ícone ou rótulo.

---

## Tipografia

**Fonte principal (texto e UI):** `Inter` — neutra, altamente legível em telas pequenas.
**Fonte de marca / títulos de destaque:** `Fraunces` (serifada, com personalidade gastronômica) usada com moderação em headings de marketing/onboarding.

| Token     | Tamanho / Linha | Peso | Uso                                  |
| --------- | --------------- | ---- | ------------------------------------ |
| `display` | 36px / 44px     | 600  | Títulos de hero (landing/onboarding) |
| `h1`      | 28px / 36px     | 600  | Título de página                     |
| `h2`      | 22px / 30px     | 600  | Seções                               |
| `h3`      | 18px / 26px     | 500  | Subseções, títulos de card           |
| `body`    | 16px / 24px     | 400  | Texto padrão                         |
| `body-sm` | 14px / 20px     | 400  | Texto auxiliar, labels               |
| `caption` | 12px / 16px     | 500  | Metadados, badges                    |

Em mobile, o tamanho base do corpo permanece 16px para evitar zoom automático em campos de formulário no iOS.

---

## Espaçamento

Escala base de **4px**. Use múltiplos: `4, 8, 12, 16, 24, 32, 48, 64`.

- Padding interno de cards: `16px` (mobile) / `24px` (desktop).
- Gap entre campos de formulário: `16px`.
- Margem entre seções: `32px`.

---

## Raios e Sombras

| Token         | Valor  | Uso                         |
| ------------- | ------ | --------------------------- |
| `radius-sm`   | 6px    | Inputs, badges              |
| `radius-md`   | 12px   | Botões, cards               |
| `radius-lg`   | 20px   | Bottom sheets, modais       |
| `radius-full` | 9999px | Avatares, contadores, pills |

| Token       | Valor                          | Uso                          |
| ----------- | ------------------------------ | ---------------------------- |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)`   | Elevação sutil de cards      |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)`  | Cards interativos, dropdowns |
| `shadow-lg` | `0 12px 32px rgba(0,0,0,0.16)` | Modais e bottom sheets       |

---

## Componentes

Cada componente abaixo mapeia diretamente para os elementos descritos em `docs/spec_ui.md`.

### Botões

- **Primário:** fundo `primary-500`, texto branco, `radius-md`, altura 48px (mobile) — ação principal (`Buscar Disponibilidade`, `Confirmar Reserva`). Hover `primary-600`, pressionado `primary-700`.
- **Secundário:** borda `neutral-300`, texto `neutral-900`, fundo transparente — ações de apoio (`Voltar`).
- **Perigo:** fundo `danger-500` — `Cancelar / Sair da Fila`, `No-show`.
- **Estados:** todos têm estado `disabled` (opacidade 50%, sem hover) e `loading` (spinner substituindo o label). Botões do painel B2B são maiores (altura 56px) para uso rápido.

### Contador de Pessoas (`CapacitySelector`)

Controle central da INT-001. Botões `–` e `+` circulares (`radius-full`), número grande e legível ao centro. Mínimo 1, máximo definido pelo restaurante. Feedback tátil/visual ao incrementar.

### Cards de Horário (`TimeSlotCard`)

Usados na INT-002 para horários alternativos. Estado disponível usa borda `primary-300`; selecionado preenche com `primary-50` e borda `primary-500`.

### Card de Fila (`WaitlistCard` / status INT-003)

Exibe posição na fila (número grande), tempo estimado e mensagem de status. Cores de estado conduzem a leitura: `warning-500` para "Aguardando", `success-500` com ícone de check para "Sua mesa está pronta!". Pensado para ficar aberto no celular — alto contraste e elementos grandes.

### Badge de Status

Pill (`radius-full`, `caption`) para a lista da Hostess: Aguardando (`warning`), Concluído (`success`), No-show/Atrasado (`danger`). Sempre cor + texto.

### Linha de Cliente (`HostessTableRow`)

Item da lista do painel B2B (INT-004). Mostra nome, número de pessoas, horário e status, com botões de ação à direita (`Check-in`, `Chamar Próximo`, `No-show`). Botões grandes, alvos de toque ≥ 44px.

### Campos de Formulário

Inputs com `radius-sm`, borda `neutral-300`, foco com borda `primary-500` e anel de foco visível. Labels em `body-sm`/peso 500. Mensagens de erro em `danger-500` abaixo do campo. Validação alinhada ao uso de `Zod` no front e back.

### Abas (Tabs)

No painel B2B: `Reservas Confirmadas` e `Fila de Espera`. Aba ativa sublinhada em `primary-500`.

---

## Ícones

Biblioteca: **Lucide** (consistente, traço limpo). Tamanho padrão 20px (UI) e 24px (ações principais). Ícones-chave: calendário, relógio, usuários/grupo, check, sino (notificação), x.

---

## Estados e Feedback

- **Loading:** spinners em botões e skeletons em listas (painel B2B e resultados de busca).
- **Tempo real (INT-003 / INT-004):** atualizações via WebSocket/polling devem ter transição suave; mudança de status dispara destaque visual breve (ex: pulso de cor).
- **Vazio:** estados vazios com ilustração leve + texto orientando a próxima ação (ex: "Nenhuma reserva para hoje").
- **Notificação "mesa pronta":** banner/toast `success-500` proeminente, acompanhando o push/SMS.

---

## Responsividade

| Breakpoint | Largura  | Alvo                                       |
| ---------- | -------- | ------------------------------------------ |
| `sm`       | ≥ 640px  | Celulares grandes                          |
| `md`       | ≥ 768px  | Tablets (painel Hostess começa a expandir) |
| `lg`       | ≥ 1024px | Desktop (painel B2B em layout pleno)       |

Telas B2C são desenhadas a partir de 360px de largura. O painel B2B prioriza ≥ 768px.

---

## Diretrizes para IA

Ao gerar o front-end:

1. Implementar os tokens acima como variáveis de tema do **Tailwind** (`tailwind.config`), não com valores hardcoded.
2. Traduzir cada componente desta seção em um componente React reutilizável, com os nomes sugeridos (`CapacitySelector`, `WaitlistCard`, `TimeSlotCard`, `HostessTableRow`).
3. Garantir contraste WCAG AA e alvos de toque ≥ 44px.
4. Aplicar Mobile-First nas telas B2C e Tablet/Desktop-First no painel B2B.
5. Respeitar a premissa de negócio: a interface foca em **número de pessoas (assentos)**, nunca em mapa físico de mesas.
