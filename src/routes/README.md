# Rotas

O TanStack Start utiliza **roteamento baseado em arquivos**. Cada arquivo `.tsx` neste diretório define uma rota. **Não** crie `src/pages/`, `src/routes/_app/index.tsx` ou `app/layout.tsx` — essas são convenções do Next.js / Remix. O único layout raiz é `src/routes/__root.tsx`.

## Convenções

| Arquivo                  | URL                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `index.tsx`              | `/`                                                                                |
| `about.tsx`              | `/about`                                                                           |
| `users/index.tsx`        | `/users`                                                                           |
| `users/$id.tsx`          | `/users/:id` (dinâmico — use `$` diretamente, sem chaves)                          |
| `posts/{-$category}.tsx` | `/posts/:category?` (segmento opcional)                                            |
| `files/$.tsx`            | `/files/*` (splat — leia através do parâmetro `_splat`, nunca `*`)                 |
| `_layout.tsx`            | rota de layout (renderiza os filhos através de `<Outlet />`)                       |
| `__root.tsx`             | estrutura principal da aplicação — envolve todas as páginas; preserve `<Outlet />` |

`routeTree.gen.ts` é gerado automaticamente. **Não edite esse arquivo manualmente.**
