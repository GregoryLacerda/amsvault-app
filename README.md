# AMSVault App 📱

App React Native + Expo para catalogar e acompanhar Animes, Séries e Mangás com integração à API Go real.

## ✨ Funcionalidades

- **Autenticação JWT** com login e registro de usuários
- **Bottom Tabs** navegação com 4 abas (Animes, Séries, Mangás, Perfil)
- **Busca e listagem** de stories (animes, séries, mangás) da API
- **Sistema de Bookmarks** para acompanhar progresso
- **Tela de Perfil** com estatísticas e logout
- **Offline-first** com AsyncStorage para token JWT

## 🚀 Requisitos

- Node.js LTS (>=18)
- npm ou yarn
- Android Studio (para emulador) OU dispositivo físico com Expo Go
- **API Go rodando** (obrigatório para funcionamento completo)

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configurar API

**IMPORTANTE:** Configure a URL da sua API Go antes de iniciar.

Edite `src/config.ts`:

```typescript
export const CONFIG = {
  API_BASE_URL: __DEV__ 
    ? 'http://SEU_IP_LOCAL:8080'  // Ex: http://192.168.1.100:8080
    : 'https://api.amsvault.com',
  // ...
};
```

**Nota:** Use o IP da sua máquina (não localhost) se testar em dispositivo físico.

## 🎮 Rodar o App

### Web (desenvolvimento rápido)
```bash
npm run web
```
Abre em `http://localhost:8081`

### Android Emulator
1. Abra Android Studio > Device Manager > inicie um AVD
2. Execute:
```bash
npm run android
```

### Dispositivo Físico (Android)
1. Instale **Expo Go** na Play Store
2. Execute:
```bash
npm start
```
3. Leia o QR Code com o Expo Go

## 📁 Estrutura do Projeto

```
amsvault-app/
├── src/
│   ├── components/          # Componentes reutilizáveis (deprecado CustomDrawer)
│   ├── contexts/
│   │   └── AuthContext.tsx  # Context de autenticação JWT
│   ├── navigation/
│   │   └── AppNavigator.tsx # Bottom Tabs navigation
│   ├── screens/
│   │   ├── LoginScreen.tsx  # Tela de login/registro
│   │   ├── ProfileScreen.tsx
│   │   ├── AnimesScreen.tsx
│   │   ├── SeriesScreen.tsx
│   │   └── MangasScreen.tsx
│   ├── services/
│   │   └── api.ts           # Service de integração com API
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   └── config.ts            # Configurações globais
├── App.tsx                  # Componente raiz com navegação condicional
└── API_DOCUMENTATION.md     # Documentação completa da API
```

## � Fluxo de Autenticação

1. **Primeira vez:** Usuário cria conta (nome, email, senha)
2. **Login:** Email e senha → Recebe JWT token
3. **Token:** Salvo no AsyncStorage e enviado em todas requisições
4. **Expiração:** Ao expirar (401), usuário é redirecionado para login
5. **Logout:** Remove token e volta para tela de login

## 🔌 Integração com API

### Endpoints Utilizados

#### Autenticação
- `POST /login` - Login
- `POST /user` - Registro

#### Usuários
- `GET /user` - Dados do usuário autenticado
- `GET /user/:id` - Buscar usuário por ID

#### Stories
- `GET /story?name=texto` - Buscar stories (animes/séries/mangás)
- `GET /story/:id` - Detalhes da story

#### Bookmarks
- `GET /bookmarks/user/:userId` - Listar bookmarks do usuário
- `POST /bookmarks` - Criar bookmark
- `PUT /bookmarks/:id` - Atualizar progresso
- `DELETE /bookmarks/:id` - Remover bookmark

### Exemplo de Uso

```typescript
// Login
await ApiService.login({ email, password });

// Buscar animes
const stories = await ApiService.getStories('one piece');
const animes = ApiService.filterStoriesBySource(stories, 'anime');

// Adicionar aos favoritos
await ApiService.createBookmark({
  user_id: 1,
  story_id: 123,
  status: 'watching',
  current_episode: 10,
});
```

## 📱 Navegação Bottom Tabs

- **📺 Animes:** Lista animes (source: 'anime')
- **🎬 Séries:** Lista séries/shows
- **📚 Mangás:** Lista mangás (source: 'manga')
- **👤 Perfil:** Dados do usuário, estatísticas e logout

## 🧪 Testes

```bash
npm test
```

## 🎨 Personalização

- **Cores:** Edite `src/config.ts` → `COLORS`
- **URL da API:** `src/config.ts` → `API_BASE_URL`
- **Timeout:** `src/config.ts` → `REQUEST_TIMEOUT`

## 📱 Build de Produção

### Android APK/AAB com EAS

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## 🛠️ Tecnologias

- React Native 0.74
- Expo SDK 51
- TypeScript
- React Navigation (Bottom Tabs)
- AsyncStorage (armazenamento de token)
- JWT Authentication

## ⚠️ Troubleshooting

### ❌ Erro CORS ao fazer login (OPTIONS 404)

**Sintoma:** `Access to fetch at 'http://localhost:8080/login' has been blocked by CORS policy`

**Causa:** API Go não está configurada para aceitar requisições do React Native Web (localhost:8081)

**Solução:** Adicione middleware CORS na sua API Go. **Veja instruções detalhadas em `CORS_SETUP.md`**

Resumo rápido:
```go
// Echo Framework
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins: []string{"http://localhost:8081"},
    AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
    AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
}))

// Gin Framework
r.Use(cors.Default())
```

### Erro de conexão com API
- Use IP da máquina ao invés de localhost no celular
- Verifique se API está rodando: `curl http://localhost:8080/login -v`

### Token expirado
- Faça login novamente
- Token é salvo automaticamente após login bem-sucedido

### Bottom Tabs não aparecem
- Verifique se está autenticado
- Limpe cache: `npm start -- --clear`

## 📝 Próximos Passos

- [ ] Tela de detalhes com mais informações da story
- [ ] Atualização de progresso nos bookmarks
- [ ] Notificações push para novos episódios
- [ ] Dark mode
- [ ] Filtragem por status/gênero

---

**Documentação da API:** Veja `API_DOCUMENTATION.md` para detalhes completos dos endpoints.

Desenvolvido com ❤️ usando React Native + Expo 🚀
