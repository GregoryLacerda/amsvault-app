# Configuração de CORS na API Go

## Problema

O navegador bloqueia requisições de `http://localhost:8081` (React Native Web) para `http://localhost:8080` (API Go) por questões de segurança (CORS - Cross-Origin Resource Sharing).

## Solução

Adicione middleware de CORS na sua API Go. Existem várias formas dependendo do framework:

### Com Echo Framework

```go
package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

func main() {
    e := echo.New()
    
    // Adicione este middleware ANTES das suas rotas
    e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{"http://localhost:8081", "http://192.168.*.*:8081"},
        AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.PATCH, echo.OPTIONS},
        AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
        AllowCredentials: true,
    }))
    
    // Suas rotas aqui
    e.POST("/login", loginHandler)
    e.POST("/user", createUserHandler)
    // ...
    
    e.Start(":8080")
}
```

### Com Gin Framework

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "time"
)

func main() {
    r := gin.Default()
    
    // Configuração de CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:8081", "http://192.168.*.*:8081"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))
    
    // Suas rotas
    r.POST("/login", loginHandler)
    r.POST("/user", createUserHandler)
    // ...
    
    r.Run(":8080")
}
```

### Solução Manual (qualquer framework)

Se não quiser usar middleware pronto, adicione este handler antes das rotas:

```go
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        w.Header().Set("Access-Control-Allow-Credentials", "true")
        
        // Se for OPTIONS, retorne 200 OK
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}

// Uso:
http.Handle("/", CORSMiddleware(yourHandler))
```

## Verificar se funcionou

Após adicionar CORS, teste com:

```bash
curl -X OPTIONS http://localhost:8080/login \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Deve retornar `200 OK` com headers `Access-Control-Allow-*`.

## Importante para Produção

⚠️ Em produção, **não use `*`** no `AllowOrigins`. Especifique apenas os domínios permitidos:

```go
AllowOrigins: []string{
    "https://seu-app.com",
    "https://www.seu-app.com",
}
```

## Teste no App

Depois de configurar CORS:

1. Reinicie a API Go
2. No app React Native, tente fazer login novamente
3. Abra as ferramentas de desenvolvedor (F12) → Network
4. Você deve ver:
   - Requisição `OPTIONS /login` → `200 OK`
   - Requisição `POST /login` → `200 OK` (com token)

---

**Referências:**
- [Echo CORS Middleware](https://echo.labstack.com/middleware/cors/)
- [Gin CORS Package](https://github.com/gin-contrib/cors)
- [MDN - CORS](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS)
