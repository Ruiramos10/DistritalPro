# DistritalPro — instruções para colocar num site grátis (dados partilhados)

Com esta versão, os clubes preenchem o boletim no computador deles e o
Gabinete Técnico vê exatamente os mesmos dados no computador da associação —
tudo gravado numa base de dados gratuita (Supabase), não no browser de cada
pessoa.

## Passo 1 — Criar a base de dados grátis (Supabase)

1. Vá a **https://supabase.com** e crie uma conta grátis (pode entrar com
   GitHub ou Google).
2. Clique em **"New project"**. Dê um nome (ex.: `distritalpro`), escolha uma
   password para a base de dados (guarde-a nalgum lado, mas não vai precisar
   dela no dia a dia) e a região mais próxima (Europe).
3. Espere cerca de 2 minutos até o projeto ficar pronto.
4. No menu da esquerda, clique em **"SQL Editor"** → **"New query"**, cole
   exatamente isto e clique em **"Run"**:

   ```sql
   create table storage_kv (
     key text primary key,
     value text not null,
     updated_at timestamptz default now()
   );

   alter table storage_kv enable row level security;

   create policy "leitura publica" on storage_kv for select using (true);
   create policy "escrita publica" on storage_kv for insert with check (true);
   create policy "atualizacao publica" on storage_kv for update using (true);
   create policy "eliminacao publica" on storage_kv for delete using (true);
   ```

   Isto cria a "tabela" onde a plataforma vai guardar tudo (equipas, quadros,
   calendários, preços) e autoriza o site a ler/escrever nela.

5. No menu da esquerda, vá a **"Project Settings"** (ícone de engrenagem) →
   **"API"**. Vai precisar de dois valores desta página:
   - **Project URL**
   - **anon public** (uma chave longa, começa por `eyJ...`)

## Passo 2 — Ligar o site à base de dados

Abra o ficheiro `src/supabase-config.js` neste projeto e substitua:

```js
export const SUPABASE_URL = "COLE_AQUI_O_PROJECT_URL";
export const SUPABASE_ANON_KEY = "COLE_AQUI_A_ANON_KEY";
```

pelos dois valores que copiou no passo anterior. Grave o ficheiro.

## Passo 3 — Gerar os ficheiros do site

Precisa de ter o [Node.js](https://nodejs.org) instalado (versão 18+). Num
terminal, dentro desta pasta:

```
npm install
npm run build
```

Isto cria uma pasta `dist/` com o site pronto a publicar.

## Passo 4 — Publicar grátis (Netlify Drop)

1. Abra **https://app.netlify.com/drop**.
2. Arraste a pasta `dist/` para essa página.
3. Recebe logo um link (ex.: `algo.netlify.app`) — esse é o link a partilhar
   com os clubes e a usar no Gabinete Técnico. Como os dados ficam no
   Supabase (não no browser), qualquer pessoa que abra este link, em
   qualquer computador, vê e grava os mesmos dados.

## Sempre que eu fizer alterações à plataforma

Sempre que eu atualizar `src/App.jsx`, repita o Passo 3 (`npm run build`) e
arraste de novo a pasta `dist/` para o Netlify Drop. Os dados guardados no
Supabase não se perdem com isto — só o código do site é substituído.

## Nota sobre segurança

Para simplificar (esta plataforma não tem contas de utilizador individuais),
a base de dados fica aberta a qualquer pessoa que tenha o link do site e o
saiba inspecionar tecnicamente — tal como já explicámos sobre a password do
Gabinete Técnico, isto não é proteção de nível bancário, mas é suficiente
para impedir acesso casual. Se mais tarde quiser proteger isto a sério,
existe a opção de ativar autenticação real no Supabase — digam-me se chegar
a essa altura.

## Estrutura do projeto

```
site/
├── index.html            — página HTML (Tailwind CSS via CDN)
├── package.json           — dependências (React, lucide-react, xlsx, Supabase)
├── vite.config.js          — configuração do Vite
├── src/
│   ├── main.jsx             — ponto de entrada
│   ├── supabase-config.js   — cole aqui o URL e a chave do seu Supabase
│   ├── storage-shim.js      — liga a gravação ao Supabase
│   └── App.jsx              — a plataforma toda (o mesmo código do Claude)
```
