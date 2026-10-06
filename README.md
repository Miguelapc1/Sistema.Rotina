# Rotina — Organização pessoal, tarefas e hábitos

Aplicativo web completo e responsivo para organizar rotina, tarefas e hábitos do dia a dia. Interface em português (pt-BR) com tema escuro preto profundo (padrão) e tema claro.

## Funcionalidades

- **Hoje (`/`)** — visão do dia com saudação, progresso, tarefas divididas por período (manhã, tarde, noite) e painel de hábitos com sequência (streak).
- **Tarefas (`/tarefas`)** — busca, filtros por categoria, lista completa e matriz de prioridades (Eisenhower).
- **Hábitos (`/habitos`)** — grade mensal de conclusões, sequência atual/recorde, consistência de 30 dias e gestão de hábitos. Inclui a página `/habitos/como-funcionam` explicando como funciona.
- **Calendário (`/calendario`)** — visualizações de dia, semana e mês com navegação e tarefas coloridas por categoria.
- **Planejamento (`/planejamento`)** — grade da semana com resumo semanal, progresso e hábitos agendados.
- **Estatísticas (`/estatisticas`)** — gráficos de atividade dos últimos 30 dias, consistência por hábito e rankings.
- **Configurações (`/configuracoes`)** — perfil, tema claro/escuro, início da semana, formato de hora, categorias personalizadas, backup (exportar/importar JSON) e redefinição dos dados de demonstração.

## Como funciona

Os dados ficam salvos no navegador (localStorage) — não é necessário login nem conta. O app já vem com **dados de demonstração** (tarefas, hábitos, categorias e histórico de 28 dias) para você explorar; em **Configurações → Meus dados** você pode exportar um backup JSON, importar um backup ou restaurar a demonstração.

## Rodando localmente

```sh
git clone <este-repositorio>
cd rotina
npm i
npm run dev
```

Abra `http://localhost:5173` (ou a porta indicada no terminal).

## Dados de demonstração

O arquivo `rotina-backup-demo.json` contém um backup pronto dos dados de demonstração. Para carregá-lo no app, abra **Configurações → Meus dados → Importar** e selecione o arquivo.

## Estrutura do projeto

```
src/
  components/      # UI reutilizável (shell, dialogs, cards, ícones)
  components/ui/   # Componentes base (shadcn/radix)
  lib/             # Tipos, store (Context + localStorage), seed, datas
  routes/          # Páginas (TanStack Router com file-based routing)
  styles.css       # Design system (tokens oklch, temas claro/escuro)
```

## Tecnologias

- TanStack Start + TanStack Router
- React 19 + TypeScript
- Tailwind CSS v4 (tokens semânticos em oklch)
- Recharts (gráficos) · date-fns · lucide-react · sonner

## Banco de dados (Lovable Cloud / Supabase)

O app agora salva os dados na nuvem quando o usuário está conectado.

- **Login:** página `/entrar` (menu "Conta na nuvem") com e-mail/senha e Google.
- **Tabela `public.user_data`:** `user_id uuid PK`, `data jsonb` (tarefas, hábitos, categorias e configurações), `updated_at timestamptz`.
- **Segurança (RLS):** cada usuário só lê e grava a própria linha (`auth.uid() = user_id`).
- **Sincronização:** ao entrar, os dados da nuvem são carregados; cada alteração é salva automaticamente (~1s). Sem login, o app continua funcionando com armazenamento local (localStorage).
- **Migração SQL:** veja `supabase/migrations/` ou `drizzle/migrations/` no projeto.

### Variáveis de ambiente (`.env`)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```
Para usar seu próprio projeto Supabase, crie o projeto, rode o SQL da migração e preencha essas variáveis.
