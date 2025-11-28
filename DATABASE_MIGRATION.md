# Migração para Banco de Dados Local

## Resumo das Mudanças

O aplicativo AMSVault foi migrado de uma arquitetura baseada em API REST para um banco de dados local SQLite. Todas as funcionalidades foram mantidas, mas agora os dados são armazenados localmente no dispositivo.

## Estrutura do Banco de Dados

### Tabelas Criadas

1. **users**
   - id (INTEGER PRIMARY KEY)
   - name (TEXT)
   - email (TEXT UNIQUE)
   - password (TEXT)
   - created_at (DATETIME)

2. **stories**
   - id (INTEGER PRIMARY KEY)
   - mal_id (INTEGER)
   - name (TEXT)
   - source (TEXT) - anime/manga/series
   - description (TEXT)
   - total_season (INTEGER)
   - total_episode (INTEGER)
   - total_volume (INTEGER)
   - total_chapter (INTEGER)
   - status (TEXT)
   - main_picture_medium (TEXT)
   - main_picture_large (TEXT)
   - created_at (DATETIME)

3. **bookmarks**
   - id (INTEGER PRIMARY KEY)
   - user_id (INTEGER FK)
   - story_id (INTEGER FK)
   - status (TEXT) - watching/reading/completed/dropped
   - current_season (INTEGER)
   - current_episode (INTEGER)
   - current_volume (INTEGER)
   - current_chapter (INTEGER)
   - created_at (DATETIME)
   - updated_at (DATETIME)

## Arquivos Criados/Modificados

### Novos Arquivos

1. **src/services/database.ts**
   - Serviço de gerenciamento do SQLite
   - Cria tabelas, índices e gerencia operações CRUD
   - Método `seedInitialData()` para popular banco com dados de exemplo

2. **src/services/localApi.ts**
   - Camada de abstração que mantém a mesma interface do ApiService
   - Facilita a migração sem quebrar código existente
   - Implementa todos os métodos: login, register, getStories, createBookmark, etc.

3. **src/screens/DatabaseSeedScreen.tsx**
   - Tela de desenvolvimento para popular banco com dados
   - Permite criar dados de exemplo e limpar banco
   - Acessível via modal na tela de login

### Arquivos Modificados

1. **src/contexts/AuthContext.tsx**
   - Substituído `ApiService` por `LocalApiService`
   - Inicialização do banco na montagem do contexto
   - Mantém mesma interface pública

2. **src/screens/*.tsx** (HomeScreen, AnimesScreen, SeriesScreen, MangasScreen, ProfileScreen)
   - Substituído import de `ApiService` por `LocalApiService`
   - Todas as chamadas mantêm mesma sintaxe

3. **src/screens/LoginScreen.tsx**
   - Adicionado botão "⚙️ Configurar Banco de Dados"
   - Modal para acesso à tela de seed

## Como Usar

### Primeira Execução

1. Execute o app normalmente
2. Na tela de login, clique em "⚙️ Configurar Banco de Dados"
3. Clique em "Criar Dados de Exemplo"
4. Aguarde a confirmação
5. Use as credenciais fornecidas para fazer login:
   - Email: `teste@exemplo.com`
   - Senha: `123456`

### Dados de Exemplo Incluídos

O seed cria automaticamente:

**Animes:**
- One Piece (1000 episódios, ongoing)
- Attack on Titan (87 episódios, completo)
- Death Note (37 episódios, completo)

**Séries:**
- Breaking Bad (62 episódios, completo)
- Game of Thrones (73 episódios, completo)

**Mangás:**
- Naruto (700 capítulos, completo)
- Berserk (370 capítulos, ongoing)
- Tokyo Ghoul (143 capítulos, completo)

### Criando Novo Usuário

Você pode criar novos usuários normalmente pela tela de registro. Não há necessidade de usar dados de exemplo.

## Funcionalidades Mantidas

✅ Autenticação (login/registro/logout)
✅ Busca de stories por nome
✅ Adicionar favoritos (bookmarks)
✅ Atualizar progresso (episódio, capítulo)
✅ Alterar status (assistindo, completo, dropado)
✅ Filtrar por tipo (anime, série, manga)
✅ Visualizar perfil com estatísticas

## Vantagens da Nova Arquitetura

1. **Offline First**: Funciona sem conexão com internet
2. **Performance**: Acesso instantâneo aos dados
3. **Privacidade**: Dados ficam apenas no dispositivo
4. **Sem Dependências**: Não precisa de servidor backend
5. **Simplicidade**: Menos pontos de falha

## Desenvolvimento

### Limpando Dados

Use o botão "Limpar Todos os Dados" na tela de configuração para resetar o banco.

### Adicionando Novos Stories

Você pode adicionar stories pela HomeScreen (busca) ou diretamente no banco via seed.

### Estrutura de Código

```
src/
├── services/
│   ├── database.ts      # Operações diretas no SQLite
│   ├── localApi.ts      # Interface compatível com API
│   └── api.ts           # (mantido para referência)
├── contexts/
│   └── AuthContext.tsx  # Usa LocalApiService
└── screens/
    ├── DatabaseSeedScreen.tsx  # Tela de configuração
    └── ...                     # Todas usam LocalApiService
```

## Observações Importantes

- Os dados são persistidos localmente no dispositivo
- Cada dispositivo tem seu próprio banco de dados
- Não há sincronização entre dispositivos
- Para compartilhar dados, seria necessário implementar export/import

## Próximos Passos Possíveis

- [ ] Implementar export/import de dados
- [ ] Adicionar backup para cloud
- [ ] Sincronização entre dispositivos
- [ ] Integração com APIs externas (MAL, TMDB)
- [ ] Cache de imagens localmente

---

**Nota**: O arquivo `src/services/api.ts` foi mantido para referência, mas não é mais utilizado pelo aplicativo.
