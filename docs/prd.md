# Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema:** A imprevisibilidade da disponibilidade de lugares para grupos em restaurantes e bares gera longas filas de espera, frustração para os clientes que chegam e não encontram espaço para sua quantidade de convidados, e perda de receita para estabelecimentos devido a desistências.

**Solução:** Uma plataforma digital de reservas e gestão de fila onde o cliente insere a quantidade exata de pessoas, a data e o horário desejados, e o sistema aloca a capacidade dinamicamente, garantindo o espaço. Caso não haja reserva disponível, o cliente pode entrar em uma fila de espera virtual antes mesmo de sair de casa.

Para o **cliente organizador de saídas**, nossa plataforma elimina a ansiedade de não conseguir mesa para o seu grupo, oferecendo a garantia do espaço ou uma gestão de tempo transparente através da fila virtual.

Nossos Diferenciais:
- **Gestão Dinâmica de Capacidade:** O foco é no número de pessoas (assentos), permitindo ao restaurante juntar ou separar mesas nos bastidores para acomodar a demanda sem a rigidez de um mapa físico.
- **Fila de Espera Virtual Integrada:** Se o horário estiver esgotado para aquele tamanho de grupo, o usuário entra na fila remotamente e acompanha sua posição em tempo real.
- **Redução de Atrito na Chegada:** O cliente chega e senta, sem precisar negociar com a recepção.

---

## Perfis de Usuário

* Cliente Organizador (Usuário Final / B2C)
* Recepcionista/Hostess (Usuário B2B)

### Cliente Organizador

- **Problemas:** Medo de reunir um grupo de amigos e, ao chegar no local, ser informado de que a espera é de mais de 2 horas ou que não há mesas que possam ser unidas para o tamanho do grupo.
- **Objetivos:** Garantir um local que acomode todos os seus convidados simultaneamente, sem tempo de espera na porta.
- **Dados demográficos:** 20 a 45 anos, moradores de áreas urbanas, habituados a usar aplicativos para otimizar sua rotina.
- **Motivações:** Ser o "bom anfitrião", proporcionar uma saída agradável e sem estresse para seus convidados.
- **Frustrações:** Ficar em pé na calçada aguardando liberação de mesa; receber estimativas de tempo de espera irreais da equipe do restaurante.

---

## Principais Funcionalidades

### RFN-001 Motor de Busca e Reserva por Capacidade
- O usuário deve poder selecionar Data, Horário e a Quantidade de Pessoas. O sistema retornará se há disponibilidade com base na capacidade total configurada pelo restaurante para aquele momento.

**Critérios de Aceitação:**
- A interface deve permitir a seleção de grupos de 1 até um número máximo definido pelo restaurante.
- Se não houver capacidade para o grupo no horário exato, o sistema deve sugerir horários alternativos próximos.

### RFN-002 Fila de Espera Virtual (Join the Waitlist)
- Caso não haja disponibilidade de reserva antecipada, o usuário deve poder entrar na fila de espera do restaurante para aquele dia, informando o número de pessoas.

**Critérios de Aceitação:**
- O usuário deve visualizar sua posição na fila e o tempo estimado de espera de forma dinâmica.
- O usuário deve receber um alerta (push/SMS) quando for o próximo da fila ou quando a mesa estiver pronta.

### RFN-003 Gestão de Salão e Confirmação de Presença
- A recepção do restaurante deve ter um painel para visualizar a lista de reservas e a fila de espera do dia, organizadas pelo número de pessoas.

**Critérios de Aceitação:**
- A hostess deve conseguir dar *check-in* (cliente chegou), cancelar (no-show) ou chamar o próximo da fila com um clique.

---

## Requisitos Não Funcionais

### RNF-001 - Prevenção de Overbooking
O sistema deve calcular a disponibilidade em tempo real cruzando as reservas ativas, a taxa média de rotatividade (turnover) das mesas e a capacidade máxima do restaurante, garantindo que o número de assentos reservados nunca ultrapasse 100% da cota estipulada.

### RNF-002 - Notificações Assíncronas e Resiliência
O envio de notificações de "sua mesa está pronta" deve ocorrer com latência máxima de 3 segundos, utilizando canais secundários (SMS/WhatsApp) in casu de falha no envio de notificações push, para evitar que o cliente perca sua vez.

---

## Métricas de Sucesso

* **Taxa de No-Show:** Redução da porcentagem de clientes que reservam e não comparecem.
* **Redução do Tempo de Espera Físico (Wait Time):** Diminuição do tempo que o cliente passa esperando fisicamente no local após o horário da reserva/entrada na fila virtual.
* **Aumento da Taxa de Ocupação:** Maximizar a ocupação dos assentos do restaurante em horários de pico através da alocação inteligente de grupos.
* **Taxa de Conversão de Fila:** Quantos usuários que entraram na fila virtual efetivamente compareceram ao estabelecimento versus quantos desistiram.

---

## Premissas e restrições

**Premissas:**
* O estabelecimento gerenciará e atualizará ativamente o status de "Mesa Livre/Ocupada" no painel da hostess para que a fila ande de forma realista.
* Os restaurantes têm a flexibilidade física de juntar e separar mesas reais para acomodar os grupos conforme o número de pessoas agendado.

**Restrições:**
* A plataforma inicial não gerenciará o layout físico do restaurante, apenas atuará como um controle de "capacidade total de assentos" (inventory management).

## Escopo

* **V1 (MVP):** Sistema web para reservas por número de pessoas, data e hora. Painel web básico para o restaurante visualizar a lista do dia e fazer check-in dos clientes. Envio de confirmação por e-mail.
* **V2:** Lançamento da "Fila de Espera Virtual" em tempo real com acompanhamento via link e notificações via WhatsApp (integração de API).
* **V3:** Algoritmo preditivo de tempo de espera baseado no histórico de permanência dos clientes e integração de pagamentos para cobrança de taxas de cancelamento ou reservas para grupos muito grandes (ex: acima de 10 pessoas).
