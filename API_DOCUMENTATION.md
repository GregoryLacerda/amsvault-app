# AMSVault API Documentation

## Visão Geral

AMSVault é uma API REST para gerenciar séries, animes e mangas. Permite aos usuários criar contas, adicionar histórias ao banco de dados e criar bookmarks para acompanhar seu progresso de visualização/leitura.

**Base URL**: `http://localhost:{PORT}` (porta definida na configuração)

**Formato de Resposta**: JSON

**Autenticação**: JWT Bearer Token (exceto endpoints de registro e login)

---

## Índice

1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Stories (Histórias)](#stories)
4. [Bookmarks (Marcadores)](#bookmarks)
5. [Códigos de Status HTTP](#códigos-de-status-http)
6. [Exemplos de Uso](#exemplos-de-uso)

---

## Autenticação

### Login

Autentica um usuário e retorna um token JWT.

**Endpoint**: `POST /login`

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response Success (200 OK)**:
```json
{
  "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiration": 86400
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "invalid email or password",
  "status_code": 400
}
```

**Response Error (404 Not Found)**:
```json
{
  "type": "NOT_FOUND",
  "message": "user not found",
  "status_code": 404
}
```

---

## Usuários

### Criar Usuário

Registra um novo usuário no sistema.

**Endpoint**: `POST /user`

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response Success (201 Created)**:
```json
{
  "message": "user created successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "invalid request body",
  "status_code": 400
}
```

**Response Error (409 Conflict)**:
```json
{
  "type": "ALREADY_EXISTS",
  "message": "user already exists",
  "status_code": 409
}
```

---

### Buscar Usuário por Email

Retorna os dados do usuário autenticado.

**Endpoint**: `GET /user`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**: Nenhum

**Response Success (200 OK)**:
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com"
}
```

**Response Error (401 Unauthorized)**:
```json
{
  "error": "missing authorization header"
}
```

**Response Error (404 Not Found)**:
```json
{
  "type": "NOT_FOUND",
  "message": "user not found",
  "status_code": 404
}
```

---

### Buscar Usuário por ID

Retorna os dados de um usuário específico.

**Endpoint**: `GET /user/:id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**URL Parameters**:
- `id` (integer, required): ID do usuário

**Response Success (200 OK)**:
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "error": "invalid user ID"
}
```

**Response Error (404 Not Found)**:
```json
{
  "type": "NOT_FOUND",
  "message": "user not found",
  "status_code": 404
}
```

---

### Atualizar Usuário

Atualiza os dados de um usuário.

**Endpoint**: `PUT /user`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id": 1,
  "name": "João Silva Atualizado",
  "email": "joao.novo@example.com",
  "password": "novaSenha123"
}
```

**Response Success (200 OK)**:
```json
{
  "id": 1,
  "name": "João Silva Atualizado",
  "email": "joao.novo@example.com"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "invalid request body",
  "status_code": 400
}
```

---

### Deletar Usuário

Remove um usuário do sistema.

**Endpoint**: `DELETE /user/:id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**URL Parameters**:
- `id` (integer, required): ID do usuário

**Response Success (200 OK)**:
```json
{
  "message": "user deleted successfully"
}
```

**Response Error (403 Forbidden)**:
```json
{
  "error": "you can only delete your own profile"
}
```

**Response Error (404 Not Found)**:
```json
{
  "type": "NOT_FOUND",
  "message": "user not found",
  "status_code": 404
}
```

---

## Stories

### Criar Story

Adiciona uma nova história (anime/manga/série) ao banco de dados.

**Endpoint**: `POST /story`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "One Piece",
  "mal_id": 21,
  "source": "manga",
  "description": "A história de Monkey D. Luffy em busca do One Piece",
  "total_season": 0,
  "total_episode": 1000,
  "total_volume": 100,
  "total_chapter": 1050,
  "status": "ongoing",
  "main_picture": {
    "medium": "https://example.com/image_medium.jpg",
    "large": "https://example.com/image_large.jpg"
  }
}
```

**Campos Obrigatórios**:
- `name` (string): Nome da história
- `status` (string): Status da história (ongoing, completed, etc.)

**Campos Opcionais**:
- `mal_id` (integer): ID do MyAnimeList
- `source` (string): Tipo de mídia (anime, manga, novel, etc.)
- `description` (string): Descrição da história
- `total_season` (integer): Total de temporadas (para séries/animes)
- `total_episode` (integer): Total de episódios
- `total_volume` (integer): Total de volumes (para mangás/novels)
- `total_chapter` (integer): Total de capítulos (para mangás)
- `main_picture` (object): Imagens da história

**Response Success (201 Created)**:
```json
{
  "message": "Story created successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "name is required",
  "status_code": 400
}
```

---

### Buscar Story por ID

Retorna os dados de uma história específica.

**Endpoint**: `GET /story/:id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**URL Parameters**:
- `id` (integer, required): ID da história

**Response Success (200 OK)**:
```json
{
  "ID": 1,
  "MALID": 21,
  "Name": "One Piece",
  "Source": "manga",
  "Description": "A história de Monkey D. Luffy em busca do One Piece",
  "TotalSeason": 0,
  "TotalEpisode": 1000,
  "TotalVolume": 100,
  "TotalChapter": 1050,
  "Status": "ongoing",
  "MainPicture": {
    "Medium": "https://example.com/image_medium.jpg",
    "Large": "https://example.com/image_large.jpg"
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "INTERNAL_ERROR",
  "message": "invalid story ID",
  "status_code": 500
}
```

**Response Error (404 Not Found)**:
```json
{
  "type": "NOT_FOUND",
  "message": "story not found",
  "status_code": 404
}
```

---

### Buscar Story por Nome

Busca histórias por nome (busca parcial - LIKE).

**Endpoint**: `GET /story`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `name` (string, required): Nome ou parte do nome da história

**Exemplo**: `GET /story?name=one`

**Response Success (200 OK)**:
```json
[
  {
    "ID": 1,
    "MALID": 21,
    "Name": "One Piece",
    "Source": "manga",
    "Description": "A história de Monkey D. Luffy em busca do One Piece",
    "TotalSeason": 0,
    "TotalEpisode": 1000,
    "TotalVolume": 100,
    "TotalChapter": 1050,
    "Status": "ongoing",
    "MainPicture": {
      "Medium": "https://example.com/image_medium.jpg",
      "Large": "https://example.com/image_large.jpg"
    }
  },
  {
    "ID": 2,
    "MALID": 820,
    "Name": "One Punch Man",
    "Source": "anime",
    "Description": "Saitama, o herói invencível",
    "TotalSeason": 2,
    "TotalEpisode": 24,
    "TotalVolume": 0,
    "TotalChapter": 0,
    "Status": "ongoing",
    "MainPicture": {
      "Medium": "https://example.com/opm_medium.jpg",
      "Large": "https://example.com/opm_large.jpg"
    }
  }
]
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "name parameter is required",
  "status_code": 400
}
```

---

## Bookmarks

### Criar Bookmark

Cria um novo bookmark para acompanhar o progresso em uma história.

**Endpoint**: `POST /bookmarks`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "user_id": 1,
  "story_id": 1,
  "status": "watching",
  "current_season": 1,
  "current_episode": 50,
  "current_volume": 10,
  "current_chapter": 100
}
```

**Campos Obrigatórios**:
- `user_id` (integer): ID do usuário
- `story_id` (integer): ID da história

**Campos Opcionais**:
- `status` (string): Status atual (watching, reading, completed, dropped, etc.)
- `current_season` (integer): Temporada atual
- `current_episode` (integer): Episódio atual
- `current_volume` (integer): Volume atual
- `current_chapter` (integer): Capítulo atual

**Response Success (201 Created)**:
```json
{
  "message": "Bookmarks created successfully"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "empty bookmarks UserID",
  "status_code": 400
}
```

**Response Error (404 Not Found)**:
```json
{
  "type": "NOT_FOUND",
  "message": "story not found",
  "status_code": 404
}
```

---

### Buscar Bookmark por ID

Retorna os dados de um bookmark específico.

**Endpoint**: `GET /bookmarks/:id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**URL Parameters**:
- `id` (string, required): ID do bookmark (MongoDB ObjectID)

**Response Success (200 OK)**:
```json
{
  "ID": "507f1f77bcf86cd799439011",
  "UserID": 1,
  "StoryID": 1,
  "Status": "watching",
  "CurrentSeason": 1,
  "CurrentEpisode": 50,
  "CurrentVolume": 10,
  "CurrentChapter": 100,
  "CreatedAt": "2024-01-15T10:30:00Z",
  "UpdatedAt": "2024-01-20T14:45:00Z",
  "DeletedAt": "0001-01-01T00:00:00Z"
}
```

**Response Error (500 Internal Server Error)**:
```json
{
  "type": "DATABASE_ERROR",
  "message": "database error during find bookmark",
  "status_code": 500
}
```

---

### Buscar Bookmarks por Usuário

Retorna todos os bookmarks de um usuário.

**Endpoint**: `GET /bookmarks/user/:user_id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**URL Parameters**:
- `user_id` (integer, required): ID do usuário

**Response Success (200 OK)**:
```json
[
  {
    "ID": "507f1f77bcf86cd799439011",
    "UserID": 1,
    "StoryID": 1,
    "Status": "watching",
    "CurrentSeason": 1,
    "CurrentEpisode": 50,
    "CurrentVolume": 10,
    "CurrentChapter": 100,
    "CreatedAt": "2024-01-15T10:30:00Z",
    "UpdatedAt": "2024-01-20T14:45:00Z",
    "DeletedAt": "0001-01-01T00:00:00Z"
  },
  {
    "ID": "507f1f77bcf86cd799439012",
    "UserID": 1,
    "StoryID": 2,
    "Status": "completed",
    "CurrentSeason": 2,
    "CurrentEpisode": 24,
    "CurrentVolume": 0,
    "CurrentChapter": 0,
    "CreatedAt": "2024-01-10T08:15:00Z",
    "UpdatedAt": "2024-01-25T20:30:00Z",
    "DeletedAt": "0001-01-01T00:00:00Z"
  }
]
```

**Response Error (500 Internal Server Error)**:
```json
{
  "type": "DATABASE_ERROR",
  "message": "database error during find bookmarks",
  "status_code": 500
}
```

---

### Atualizar Bookmark

Atualiza os dados de um bookmark existente.

**Endpoint**: `PUT /bookmarks/:id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**URL Parameters**:
- `id` (string, required): ID do bookmark

**Request Body**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "user_id": 1,
  "story_id": 1,
  "status": "watching",
  "current_season": 1,
  "current_episode": 75,
  "current_volume": 15,
  "current_chapter": 150
}
```

**Campos Obrigatórios**:
- `id` (string): ID do bookmark
- `user_id` (integer): ID do usuário
- `story_id` (integer): ID da história

**Response Success (200 OK)**:
```json
{
  "ID": "507f1f77bcf86cd799439011",
  "UserID": 1,
  "StoryID": 1,
  "Status": "watching",
  "CurrentSeason": 1,
  "CurrentEpisode": 75,
  "CurrentVolume": 15,
  "CurrentChapter": 150,
  "CreatedAt": "2024-01-15T10:30:00Z",
  "UpdatedAt": "2024-01-26T16:20:00Z",
  "DeletedAt": "0001-01-01T00:00:00Z"
}
```

**Response Error (400 Bad Request)**:
```json
{
  "type": "VALIDATION_ERROR",
  "message": "empty bookmarks ID",
  "status_code": 400
}
```

---

### Deletar Bookmark

Remove um bookmark do sistema.

**Endpoint**: `DELETE /bookmarks/:id`

**Autenticação**: Requerida (JWT)

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `id` (string, required): ID do bookmark

**Exemplo**: `DELETE /bookmarks/123?id=507f1f77bcf86cd799439011`

**Response Success (200 OK)**:
```json
{
  "message": "Bookmarks deleted successfully"
}
```

**Response Error (500 Internal Server Error)**:
```json
{
  "type": "DATABASE_ERROR",
  "message": "database error during delete bookmark",
  "status_code": 500
}
```

---

## Códigos de Status HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Erro de validação ou parâmetros inválidos |
| 401 | Unauthorized | Token JWT ausente ou inválido |
| 403 | Forbidden | Usuário não tem permissão para a ação |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: recurso já existe) |
| 500 | Internal Server Error | Erro interno do servidor |
| 503 | Service Unavailable | Serviço externo indisponível |

---

## Exemplos de Uso

### Exemplo 1: Fluxo Completo de Registro e Login

```bash
# 1. Registrar novo usuário
curl -X POST http://localhost:8080/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "password": "senha123"
  }'

# 2. Fazer login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "senha123"
  }'

# Resposta:
# {
#   "acces_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiration": 86400
# }
```

### Exemplo 2: Adicionar uma História e Criar Bookmark

```bash
# 1. Criar uma história (usar o token recebido no login)
curl -X POST http://localhost:8080/story \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Attack on Titan",
    "mal_id": 16498,
    "source": "anime",
    "description": "Humanidade luta contra titãs",
    "total_season": 4,
    "total_episode": 87,
    "status": "completed",
    "main_picture": {
      "medium": "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      "large": "https://cdn.myanimelist.net/images/anime/10/47347l.jpg"
    }
  }'

# 2. Buscar a história criada
curl -X GET "http://localhost:8080/story?name=Attack" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Criar bookmark (assumindo que story_id=1 e user_id=1)
curl -X POST http://localhost:8080/bookmarks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": 1,
    "story_id": 1,
    "status": "watching",
    "current_season": 2,
    "current_episode": 10
  }'
```

### Exemplo 3: Atualizar Progresso de Visualização

```bash
# Atualizar bookmark (assumindo bookmark_id obtido anteriormente)
curl -X PUT http://localhost:8080/bookmarks/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "id": "507f1f77bcf86cd799439011",
    "user_id": 1,
    "story_id": 1,
    "status": "watching",
    "current_season": 3,
    "current_episode": 15
  }'
```

### Exemplo 4: Listar Todos os Bookmarks de um Usuário

```bash
# Buscar todos os bookmarks do usuário (user_id=1)
curl -X GET http://localhost:8080/bookmarks/user/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Estrutura de Erros

Todos os erros seguem um formato padronizado:

```json
{
  "type": "TIPO_DO_ERRO",
  "message": "Mensagem descritiva do erro",
  "status_code": 400
}
```

**Tipos de Erro**:
- `VALIDATION_ERROR`: Erro de validação de dados
- `NOT_FOUND`: Recurso não encontrado
- `ALREADY_EXISTS`: Recurso já existe
- `UNAUTHORIZED`: Não autorizado
- `FORBIDDEN`: Acesso proibido
- `INTERNAL_ERROR`: Erro interno do servidor
- `DATABASE_ERROR`: Erro de banco de dados
- `EXTERNAL_SERVICE_ERROR`: Erro em serviço externo

---

## Notas Importantes

1. **Autenticação**: Todas as rotas exceto `/login` e `POST /user` requerem um token JWT válido no header `Authorization`.

2. **Token JWT**: O token expira após o tempo especificado no campo `expiration` (em segundos). Após expirar, é necessário fazer login novamente.

3. **IDs de Bookmark**: Os bookmarks usam MongoDB ObjectID (string hexadecimal de 24 caracteres), enquanto stories e users usam IDs inteiros.

4. **Busca por Nome**: A busca de stories por nome é case-insensitive e usa LIKE (busca parcial).

5. **Soft Delete**: Alguns recursos podem usar soft delete, verificar o campo `DeletedAt` nas respostas.

6. **Validações**:
   - Nome da história é obrigatório
   - Status da história é obrigatório
   - UserID e StoryID são obrigatórios para bookmarks
   - Números negativos não são permitidos para season, episode, volume e chapter

---

## Suporte e Contribuição

Para reportar bugs ou sugerir melhorias, entre em contato através do repositório do projeto.

**Repositório**: https://github.com/GregoryLacerda/AMSVault

---

**Versão da Documentação**: 1.0  
**Última Atualização**: Novembro 2025
