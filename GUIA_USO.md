# Guia Rápido - AMSVault (Versão Local)

## 🚀 Início Rápido

### 1. Primeira Vez no App

Ao abrir o app pela primeira vez, você verá a tela de login vazia.

**Opção A: Usar Dados de Exemplo**
1. Clique no botão "⚙️ Configurar Banco de Dados"
2. Clique em "Criar Dados de Exemplo"
3. Aguarde a mensagem de sucesso
4. Feche o modal
5. Use as credenciais:
   - Email: `teste@exemplo.com`
   - Senha: `123456`

**Opção B: Criar Sua Conta**
1. Clique em "Não tem conta? Registre-se"
2. Preencha nome, email e senha
3. Clique em "Registrar"
4. Você será logado automaticamente

### 2. Explorando o App

Após o login, você terá acesso a 5 abas:

#### 🏠 Home
- **Buscar stories**: Digite o nome e pressione Enter
- **Adicionar favorito**: Clique no botão de coração nos cards
- Os stories aparecerão na aba correspondente (Animes/Séries/Mangás)

#### 📺 Animes
- Veja seus animes favoritos
- **Atualizar episódio**: Digite o número no campo
- **Mudar status**: Selecione no dropdown (Assistindo/Completo/Dropado)
- **Confirmar**: Clique no botão verde para salvar

#### 🎬 Séries
- Mesma funcionalidade dos Animes
- Mostra séries de TV

#### 📚 Mangás
- Mesma funcionalidade dos Animes
- Mostra mangás

#### 👤 Perfil
- Veja suas estatísticas
- Total de favoritos por tipo
- Botão de logout

## 💡 Dicas

### Busca Inteligente
- A busca funciona com correspondência parcial
- Exemplo: "one" encontrará "One Piece"
- Não diferencia maiúsculas/minúsculas

### Gerenciando Progresso
1. Digite o episódio/capítulo atual
2. Mude o status se quiser
3. **Importante**: Clique em "Confirmar" para salvar!

### Status Disponíveis
- **Assistindo/Lendo**: Consumindo atualmente
- **Completo**: Finalizou completamente
- **Dropado**: Abandonou

### Adicionando Novos Stories
Como o banco é local, você pode adicionar stories de duas formas:

**Pelo App:**
- Use a busca na Home (se o story já existir no banco)

**Pelo Banco:**
- Use a tela de configuração para adicionar mais dados

## 🔧 Gerenciamento do Banco

### Acessar Configurações
1. Faça logout (aba Perfil)
2. Na tela de login, clique em "⚙️ Configurar Banco de Dados"

### Limpar Dados
**⚠️ ATENÇÃO: Esta ação não pode ser desfeita!**
1. Acesse as configurações do banco
2. Clique em "Limpar Todos os Dados"
3. Confirme a ação
4. Todos os usuários, stories e bookmarks serão removidos

### Recriar Dados de Exemplo
Após limpar, você pode criar novos dados de exemplo clicando em "Criar Dados de Exemplo" novamente.

## 📊 Dados de Exemplo Incluídos

### Animes (3)
- One Piece - 1000 eps, Ongoing
- Attack on Titan - 87 eps, Completo
- Death Note - 37 eps, Completo

### Séries (2)
- Breaking Bad - 62 eps, Completo
- Game of Thrones - 73 eps, Completo

### Mangás (3)
- Naruto - 700 caps, Completo
- Berserk - 370 caps, Ongoing
- Tokyo Ghoul - 143 caps, Completo

## ❓ Problemas Comuns

### "Nenhum anime/série/manga encontrado"
**Causa**: Você não tem favoritos ainda
**Solução**: Adicione stories pela aba Home

### "Email ou senha inválidos"
**Causa**: Credenciais incorretas ou usuário não existe
**Solução**: 
- Verifique as credenciais
- Ou crie uma nova conta
- Ou use os dados de exemplo

### Stories não aparecem na busca
**Causa**: O story não está no banco local
**Solução**: O banco local tem apenas os stories que você adicionar

### Botão "Confirmar" não aparece
**Causa**: Você não fez nenhuma alteração
**Solução**: Mude o episódio ou status primeiro

## 🎯 Fluxo Completo de Uso

```
1. Login/Registro
   ↓
2. Home: Buscar story
   ↓
3. Adicionar aos favoritos (❤️)
   ↓
4. Ir para aba correspondente (Animes/Séries/Mangás)
   ↓
5. Atualizar progresso e status
   ↓
6. Clicar em "Confirmar"
   ↓
7. Ver estatísticas no Perfil
```

## 🔒 Privacidade

- Todos os dados ficam **apenas no seu dispositivo**
- Não há envio de dados para servidores
- Não há sincronização entre dispositivos
- Para transferir dados, você precisará usar export/import (recurso futuro)

## 📱 Compatibilidade

- ✅ Android
- ✅ iOS
- ✅ Web (Expo)

---

**Dúvidas?** Este é um app offline-first. Todos os dados são locais!
