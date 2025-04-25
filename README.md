# Santos Alerta - Aplicativo de Alerta de Alagamentos

Este é um aplicativo web para reportar e visualizar alagamentos na cidade de Santos, SP.

## Visão Geral

O Santos Alerta foi desenvolvido para ajudar os moradores e visitantes de Santos a evitarem áreas alagadas durante períodos de chuva. O aplicativo permite que os usuários:

- Visualizem alagamentos ativos em um mapa interativo
- Reportem novos pontos de alagamento
- Confirmem ou neguem a veracidade dos reportes
- Filtrem alagamentos por tempo, severidade e bairro

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, Tailwind CSS, Leaflet
- **Backend**: Supabase (PostgreSQL)
- **Hospedagem**: Vercel (recomendado)

## Instruções para Implantação

### 1. Preparar o Banco de Dados no Supabase

1. **Acesse sua conta no Supabase** (https://supabase.com)
2. **Crie um novo projeto**:
   - Dê um nome como "santos-alerta"
   - Escolha uma senha segura para o banco de dados
   - Selecione a região mais próxima do Brasil

3. **Configure o banco de dados**:
   - No menu lateral, vá para "SQL Editor"
   - Clique em "New Query"
   - Cole o conteúdo do arquivo `migrations/0001_initial.sql`
   - Clique em "Run" para executar o script SQL

4. **Obtenha as credenciais**:
   - No menu lateral, vá para "Project Settings" > "API"
   - Anote a "URL" e a "anon key" (chave anônima)

### 2. Implantar na Vercel

1. **Acesse sua conta na Vercel** (https://vercel.com)
2. **Importe o projeto**:
   - Clique em "Add New" > "Project"
   - Conecte sua conta GitHub se ainda não estiver conectada
   - Selecione este repositório
   - Clique em "Import"

3. **Configure o projeto**:
   - Em "Framework Preset", selecione "Next.js"
   - Expanda a seção "Environment Variables"
   - Adicione duas variáveis:
     - Nome: `NEXT_PUBLIC_SUPABASE_URL` / Valor: [URL do Supabase que você anotou]
     - Nome: `NEXT_PUBLIC_SUPABASE_ANON_KEY` / Valor: [chave anônima do Supabase que você anotou]
   - Clique em "Deploy"

4. **Aguarde a implantação**:
   - A Vercel vai construir e implantar o aplicativo
   - Quando terminar, você verá uma mensagem de sucesso e um link para o seu aplicativo

## Desenvolvimento Local

Se você quiser executar o aplicativo localmente:

1. Clone este repositório
2. Instale as dependências:
   ```
   pnpm install
   ```
3. Crie um arquivo `.env.local` na raiz do projeto com as variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```
4. Inicie o servidor de desenvolvimento:
   ```
   pnpm dev
   ```
5. Acesse `http://localhost:3000` no seu navegador

## Documentação

Para mais informações, consulte os arquivos na pasta `documentacao`:

- `manual_usuario.md`: Guia completo para usuários finais
- `guia_implantacao.md`: Instruções detalhadas de implantação
- `documentacao_tecnica.md`: Detalhes técnicos do projeto
- `resumo_projeto.md`: Visão geral do projeto

## Licença

Este projeto é de código aberto e está disponível para uso e modificação.
