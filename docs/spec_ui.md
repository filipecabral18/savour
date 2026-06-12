# Especificação de UI

## Interfaces gráficas

Abaixo estão detalhadas as principais interfaces gráficas da plataforma, divididas entre a experiência do Cliente Organizador (B2C) e o Painel da Recepcionista/Hostess (B2B).

### INT-001 - Tela de Busca de Disponibilidade (B2C)

- **Tipo de contêiner:** Página Principal (Mobile-First).
- **Campos:** - Seletor de Data (Calendário).
  - Seletor de Horário.
  - Contador de Quantidade de Pessoas (assentos).
- **Botões:** - `Buscar Disponibilidade` (Ação primária).
- **Links:** - `Entrar / Cadastrar-se`.
  - `Área do Restaurante` (Redirecionamento B2B).
- **Considerações:** A interface deve ser minimalista, focando na agilidade para o cliente inserir a quantidade exata de pessoas, data e horário desejados. O contador de pessoas deve permitir a seleção de grupos a partir de 1 até o número máximo definido pelo restaurante.

### INT-002 - Resultados e Confirmação/Fila (B2C)

- **Tipo de contêiner:** Página ou *Bottom Sheet* Modal.
- **Campos:** - Resumo da busca (Data, Hora, Número de Pessoas).
  - *Cards* de Horários Alternativos (caso o horário exato não esteja disponível).
- **Botões:** - `Confirmar Reserva` (Habilitado se houver disponibilidade de capacidade).
  - `Entrar na Fila de Espera` (Habilitado se não houver reserva antecipada disponível para o horário).
- **Links:** - `Voltar para a busca`.
- **Considerações:** Esta tela é o ponto de decisão. O sistema deve alocar a capacidade dinamicamente e apresentar de forma clara se o espaço está garantido ou se o usuário precisará entrar na fila de espera virtual.

### INT-003 - Acompanhamento da Fila de Espera Virtual (B2C)

- **Tipo de contêiner:** Página de Status (Atualização em tempo real).
- **Campos:** - Número da Posição Atual na Fila.
  - Tempo Estimado de Espera (Exibição dinâmica).
  - Mensagem de Status (ex: "Aguardando", "Sua mesa está pronta! Dirija-se à recepção.").
- **Botões:** - `Cancelar / Sair da Fila`.
- **Links:** - N/A.
- **Considerações:** Deve ser uma tela leve, feita para ficar aberta no celular do usuário. Deve conter *feedback* visual claro (cores, ícones) quando a mesa estiver pronta, acompanhando o alerta de push/SMS.

### INT-004 - Painel de Gestão de Salão e Fila (B2B - Hostess)

- **Tipo de contêiner:** Dashboard Web (Otimizado para *Tablets* e Desktop).
- **Campos:** - Filtro por Data.
  - Abas: `Reservas Confirmadas` e `Fila de Espera`.
  - Lista de clientes, organizada pelo número de pessoas do grupo e horário.
  - Status do cliente (Aguardando, Atrasado, Concluído).
- **Botões:** Em cada item da lista de clientes:
  - `Check-in` (Confirmar que o cliente chegou).
  - `Chamar Próximo` (Apenas na aba de Fila de Espera, envia notificação ao cliente).
  - `Cancelar / No-show` (Registrar desistência ou não comparecimento).
- **Links:** - `Configurações do Restaurante` (Capacidade máxima, etc).
  - `Sair da Conta`.
- **Considerações:** A interface deve privilegiar a velocidade de operação. Botões grandes e *feedbacks* instantâneos na tela são cruciais para que a *hostess* não perca tempo lidando com o software enquanto atende os clientes físicos.

---

## Fluxo de Navegação

O fluxo de navegação foi desenhado para eliminar atritos, dividindo a jornada em duas pontas integradas:

**Fluxo do Cliente Organizador (B2C):**
1. O usuário acessa a **INT-001 (Tela de Busca)** e insere os dados do grupo (Pax, Data, Hora).
2. O usuário é direcionado para a **INT-002 (Resultados)**.
3. **Cenário A (Disponível):** O usuário clica em "Confirmar Reserva" e recebe o comprovante/e-mail de confirmação. Fim do fluxo.
4. **Cenário B (Indisponível):** O usuário clica em horários alternativos sugeridos ou seleciona "Entrar na Fila de Espera".
5. Ao entrar na fila, é redirecionado para a **INT-003 (Acompanhamento)**, onde monitora seu status até receber a notificação de que a mesa está pronta. O cliente chega e senta.

**Fluxo da Recepcionista/Hostess (B2B):**
1. Realiza o login e acessa a **INT-004 (Painel de Gestão)**.
2. Visualiza a consolidação das reservas e da fila do dia.
3. Quando um cliente com reserva antecipada chega, clica em "Check-in".
4. Quando uma capacidade no salão é liberada, visualiza a lista de espera e clica em "Chamar Próximo", acionando automaticamente a notificação para o cliente aguardando.

---

## Diretrizes para IA

Este documento de Especificação de UI deve ser utilizado por assistentes de IA e geradores de código como base arquitetural para a construção do *Front-end*. A IA deve interpretar este documento da seguinte forma:

1. **Componentização:** Cada interface (INT) deve ser traduzida em páginas principais ou rotas, enquanto os "Campos" e "Botões" devem ser estruturados como componentes reutilizáveis (ex: `CapacitySelector`, `WaitlistCard`, `HostessTableRow`).
2. **Design System:** Priorizar abordagens *Mobile-First* para as telas B2C (INT-001, INT-002, INT-003) e *Tablet/Desktop-First* para o painel B2B (INT-004), abstraindo o uso de bibliotecas de estilo utilitárias.
3. **Gestão de Estado:** A IA deve prever a necessidade de estados assíncronos e reativos (como *loading spinners* em cliques de reserva e conexões de *WebSocket* ou *Polling* para a atualização dinâmica da INT-003 e INT-004).
4. **Fidelidade ao Negócio:** A interface gerada não deve focar em renderizar plantas físicas ou mapas de mesa, respeitando a premissa de negócio de focar apenas no *número de pessoas (assentos)*.