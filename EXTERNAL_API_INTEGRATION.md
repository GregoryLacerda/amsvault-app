# Integração com APIs Externas

O app agora busca informações diretamente de APIs públicas na internet!

## APIs Utilizadas

### 1. **Jikan API** (MyAnimeList)
- **URL:** https://jikan.moe/
- **Uso:** Buscar animes, mangás e manhwas
- **Gratuita:** ✅ Sim, não requer autenticação
- **Limite:** ~3 requisições por segundo
- **Documentação:** https://docs.api.jikan.moe/

### 2. **TMDB API** (The Movie Database) - OPCIONAL
- **URL:** https://www.themoviedb.org/
- **Uso:** Buscar séries de TV
- **Gratuita:** ✅ Sim, mas requer API Key
- **Como obter:**
  1. Crie uma conta em https://www.themoviedb.org/signup
  2. Vá em Configurações → API
  3. Solicite uma chave de API (aprovação automática)
  4. Substitua `YOUR_TMDB_API_KEY` em `src/services/externalApi.ts`

## Como Funciona

### Fluxo de Busca

1. **Usuário digita** um nome na tela inicial
2. **Seleciona filtro** (Todos, Animes, Mangás, Séries)
3. **Sistema busca em paralelo:**
   - APIs externas (Jikan, TMDB)
   - Banco de dados local
4. **Combina resultados**, removendo duplicados
5. **Mostra cards** com imagens, descrições e botão "Favoritar"

### Ao Favoritar

1. **Se a história vem de API externa:**
   - Salva primeiro no banco de dados local
   - Gera um ID local
   - Cria o bookmark vinculado ao ID local
2. **Se já existe no banco:**
   - Cria bookmark diretamente

## Recursos

### ✅ Implementado
- Busca em APIs externas (Jikan)
- Busca no banco local
- Filtros por tipo (Todos, Animes, Mangás, Séries)
- Salvamento automático de histórias externas
- Imagens das capas (posters)
- Descrições completas
- Status (ongoing/completed)
- Total de episódios/capítulos

### 🔄 Em Desenvolvimento
- Integração TMDB (requer API key)
- Cache de resultados
- Paginação de resultados
- Busca offline

## Configuração Opcional - TMDB

Para habilitar busca de séries na TMDB:

1. **Obtenha uma API Key:**
   ```
   https://www.themoviedb.org/settings/api
   ```

2. **Edite o arquivo:**
   ```typescript
   // src/services/externalApi.ts
   const API_KEY = 'sua_chave_aqui'; // linha ~76
   ```

3. **Pronto!** A busca de séries estará habilitada

## Estrutura de Dados

### Histórias Externas
```typescript
{
  id: number;              // ID da API externa (mal_id, tmdb_id)
  name: string;            // Nome/Título
  source: string;          // 'anime', 'manga', 'manhwa', 'series'
  description: string;     // Sinopse completa
  status: string;          // 'ongoing', 'completed'
  main_picture: {
    medium: string;        // URL da imagem média
    large: string;         // URL da imagem grande
  };
  total_episode?: number;  // Total de episódios
  total_chapter?: number;  // Total de capítulos
}
```

## Exemplos de Busca

### Animes
```
"Naruto" → Busca na Jikan API
"One Piece" → Retorna dados do MyAnimeList
"Attack on Titan" → Inclui imagens e descrição
```

### Mangás
```
"One Piece" → Type: Manga
"Solo Leveling" → Type: Manhwa (detectado automaticamente)
```

### Séries (com TMDB configurada)
```
"Breaking Bad"
"Game of Thrones"
"Stranger Things"
```

## Vantagens

✅ **Dados atualizados** direto das fontes oficiais
✅ **Imagens de qualidade** (capas oficiais)
✅ **Descrições completas** em inglês
✅ **Gratuito** (Jikan não requer conta)
✅ **Offline-ready** (salva no banco local após favoritar)

## Limitações

⚠️ **Rate Limiting**: Jikan API tem limite de ~3 req/s
⚠️ **Idioma**: Descrições em inglês (pode traduzir com API)
⚠️ **TMDB**: Requer API key para séries
⚠️ **Dependência**: Requer internet para buscar

## Troubleshooting

### "Erro ao buscar"
- Verifique sua conexão com internet
- Aguarde alguns segundos (rate limiting)
- Tente buscar no banco local

### "Nenhum resultado"
- Tente termos diferentes em inglês
- Verifique se o filtro está correto
- Alguns títulos podem ter nomes diferentes

### TMDB não funciona
- Verifique se adicionou a API key
- Confirme que a key está válida
- Teste em https://www.themoviedb.org/

## Links Úteis

- [Jikan API Docs](https://docs.api.jikan.moe/)
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [MyAnimeList](https://myanimelist.net/)
