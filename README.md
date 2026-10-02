# Recibo Costureira

Sistema simples de recibos: login, lista de serviços com total, impressão e histórico diário.
React + Vite (JavaScript/CSS) e Firebase (Authentication + Firestore).

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha com as chaves do seu projeto Firebase.
3. `npm run dev`

## Configurar o Firebase

1. Crie um projeto em https://console.firebase.google.com
2. Authentication > Método de login > ative **E-mail/senha** e crie o usuário da sua tia em "Usuários".
3. Firestore Database > Criar banco de dados.
4. Em "Regras", cole o conteúdo de `firestore.rules`.
5. Configurações do projeto > Seus apps > Web (</>) > copie as chaves para o `.env`.

## Publicar (grátis)

`npm run build` e envie a pasta `dist` para o Firebase Hosting (`firebase deploy`) ou para a Vercel.
Cadastre as variáveis do `.env` no serviço de hospedagem.
