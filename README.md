# Rotina

Aplicação web para organização pessoal, gerenciamento de tarefas e acompanhamento de hábitos.

O projeto reúne tarefas, hábitos, calendário e planejamento semanal em uma única interface, com suporte a armazenamento local e sincronização com Supabase.

## Screenshots

### Dashboard

![Dashboard](./docs/images/dashboard.png)

### Tarefas

![Tarefas](./docs/images/tarefas.png)

### Hábitos

![Hábitos](./docs/images/habitos.png)

### Calendário

![Calendário](./docs/images/calendario.png)

---

## Funcionalidades

- Dashboard com resumo das atividades do dia
- Gerenciamento de tarefas e categorias
- Matriz de prioridades (Eisenhower)
- Criação e acompanhamento de hábitos
- Controle de sequência e consistência
- Calendário com visualização diária, semanal e mensal
- Planejamento semanal
- Estatísticas dos últimos 30 dias
- Tema claro e escuro
- Exportação e importação de dados em JSON
- Dados de demonstração para testes

### Conta e sincronização

O sistema pode ser utilizado sem cadastro, mantendo os dados no `localStorage`.

Quando conectado ao Supabase, o usuário pode fazer login e manter os dados sincronizados na nuvem.

A autenticação suporta:

- E-mail e senha
- Google

---

## Tecnologias

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- Tailwind CSS v4
- Vite
- Supabase
- PostgreSQL
- Recharts
- date-fns
- Lucide React
- Sonner

---

## Banco de dados

A persistência em nuvem utiliza Supabase com PostgreSQL.

Os dados da aplicação são armazenados na tabela:

```text
public.user_data
