# Guia para Gerar APK do AMSVault

## ✅ Ícone Criado
O ícone azul com as iniciais "AV" foi criado em `assets/icon.png` e configurado no app.json.

## 📦 Gerar APK - Método 1: EAS Build (Recomendado)

### Passo 1: Criar conta no Expo (se não tiver)
1. Acesse: https://expo.dev/signup
2. Crie sua conta gratuita

### Passo 2: Fazer login
```powershell
npx eas-cli login
```

### Passo 3: Configurar o projeto
```powershell
npx eas-cli build:configure
```

### Passo 4: Gerar o APK
```powershell
npx eas-cli build --platform android --profile preview
```

O build será feito na nuvem e você receberá um link para baixar o APK (leva ~10-15 minutos).

---

## 📦 Método 2: Build Local (Requer Android Studio)

### Requisitos:
- Android Studio instalado
- Android SDK configurado
- JDK instalado

### Comando:
```powershell
npx eas-cli build --platform android --profile preview --local
```

---

## 📦 Método 3: Usar Expo Go (Sem APK)

Você já pode usar o app no celular sem gerar APK:

1. Instale o **Expo Go** (Play Store)
2. No computador, rode: `npx expo start`
3. Escaneie o QR code
4. O app abre no Expo Go

---

## 🎯 Método Recomendado

**Use o Método 1 (EAS Build)** porque:
- ✅ Não precisa instalar Android Studio
- ✅ Build feito na nuvem (gratuito)
- ✅ Gera APK pronto para instalar
- ✅ Funciona em qualquer computador

### Comandos Rápidos:
```powershell
# 1. Login
npx eas-cli login

# 2. Configurar (uma vez)
npx eas-cli build:configure

# 3. Gerar APK
npx eas-cli build --platform android --profile preview
```

Após o build, você receberá um link como:
```
https://expo.dev/artifacts/eas/...apk
```

Baixe o APK no seu celular e instale! 📱

---

## 📝 Notas

- O build preview é gratuito e ilimitado
- O APK gerado pode ser instalado em qualquer Android
- Não precisa publicar na Play Store
- O ícone azul já está configurado automaticamente
