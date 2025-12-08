# Configuração da API do MyAnimeList

## Como obter o Client ID do MyAnimeList

Para usar a busca de animes diretamente da API do MyAnimeList, você precisa criar uma API key:

### Passo 1: Criar Conta no MyAnimeList
1. Acesse https://myanimelist.net
2. Crie uma conta ou faça login se já tiver uma

### Passo 2: Registrar um Aplicativo
1. Acesse https://myanimelist.net/apiconfig
2. Clique em "Create ID"
3. Preencha os dados:
   - **App Name**: AMSVault (ou qualquer nome)
   - **App Type**: Selecione "other"
   - **App Description**: "App para gerenciar animes, mangás e séries"
   - **App Redirect URL**: `http://localhost` (pode deixar assim para desenvolvimento)
   - **Homepage URL**: `http://localhost` (opcional)
   - **Commercial/Non-Commercial**: Selecione "non-commercial"

4. Clique em "Submit"

### Passo 3: Obter o Client ID
1. Após criar, você verá seu **Client ID** e **Client Secret**
2. Copie o **Client ID** (você NÃO precisa do Client Secret para busca básica)

### Passo 4: Configurar no App
Abra o arquivo `src/services/malApi.ts` e substitua a linha:

```typescript
private readonly CLIENT_ID = 'YOUR_MAL_CLIENT_ID';
```

Por:

```typescript
private readonly CLIENT_ID = 'seu_client_id_aqui';
```

### Exemplo de Request
Após configurar, a busca será feita assim:

```http
GET https://api.myanimelist.net/v2/anime?q=naruto&limit=10&fields=id,title,main_picture,synopsis
X-MAL-CLIENT-ID: seu_client_id_aqui
```

## Limites da API

- **Rate Limit**: A API do MyAnimeList tem limites de requisições
- **Gratuito**: Não precisa pagar, mas tem limite de requests por minuto
- **Sem Autenticação OAuth**: Para busca básica, só o Client ID é suficiente

## Documentação Oficial

https://myanimelist.net/apiconfig/references/api/v2

## Fallback

Se a API do MAL falhar, o app automaticamente usa a busca local do servidor Go como fallback.
