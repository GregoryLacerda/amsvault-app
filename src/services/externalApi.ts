// Serviço para buscar dados de APIs externas (MAL oficial, TMDB, etc.)

// Credenciais da API oficial do MyAnimeList
const MAL_CONFIG = {
  API_URL: 'https://api.myanimelist.net/v2',
  CLIENT_ID: 'ad54544a8b8d50ae524bd6e2f552b62d',
  ACCESS_TOKEN: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjhiZWEyMGRhMGEyNmVmYjhhYzk2Yjg3YTI1YjNkZWRmYTlmYWRhZmJhMTA3ODRlMzBhNzdhODZjNzc1MGE4YzI3ZTY4ODE0MmI1MWYyZDUzIn0.eyJhdWQiOiJhZDU0NTQ0YThiOGQ1MGFlNTI0YmQ2ZTJmNTUyYjYyZCIsImp0aSI6IjhiZWEyMGRhMGEyNmVmYjhhYzk2Yjg3YTI1YjNkZWRmYTlmYWRhZmJhMTA3ODRlMzBhNzdhODZjNzc1MGE4YzI3ZTY4ODE0MmI1MWYyZDUzIiwiaWF0IjoxNzYzMjY1MzM1LCJuYmYiOjE3NjMyNjUzMzUsImV4cCI6MTc2NTg1NzMzNSwic3ViIjoiNzczNzk0OCIsInNjb3BlcyI6W119.Ql_Igu2zSdr63WOICPKsGf7pVpNepMbUs5BaUAf77XouPISRmqiZLr3DcXQfyygYBzPpLBvhrEH9Hbp8oHfAcNAdvVcav5n5hFtQ5ZUf_-Ig1RjznJ__lpbNBor_xBDiEEaPSTvoM4JVpNcW9wevojU3M874hUVKWOyoH3cY3xECKd3cJGzrUtlBFREpjb0pNhRvxJMSyV93tfNuE3K61RQAz2qCf6tL7dZ7z-eemmN1rDk6qrDuE6s1H5KvZT4wxTMZc0UhgHFmMGsKVVslwEEkVypoogCIdr5wNl1pRPpUmbjQ7jQRVF9IXcO2o0AdrjvyvL9dDcVnU2ZitJ6KqQ',
};

interface ExternalStory {
  id: number;
  name: string;
  source: string;
  description: string;
  status: string;
  main_picture: {
    medium?: string;
    large?: string;
  };
  total_episode?: number;
  total_season?: number;
  total_chapter?: number;
  total_volume?: number;
}

/**
 * Busca animes na API oficial do MyAnimeList
 */
async function searchAnime(query: string): Promise<ExternalStory[]> {
  try {
    const response = await fetch(
      `${MAL_CONFIG.API_URL}/anime?q=${encodeURIComponent(query)}&limit=100&fields=id,title,synopsis,num_episodes,status,main_picture,media_type`,
      {
        headers: {
          'X-MAL-CLIENT-ID': MAL_CONFIG.CLIENT_ID,
          'Authorization': `Bearer ${MAL_CONFIG.ACCESS_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Erro na API MAL:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return [];
    }
    
    // Remove duplicatas baseado no ID e retorna apenas os 100 primeiros resultados
    const uniqueResults = new Map();
    data.data.forEach((item: any) => {
      const anime = item.node;
      if (!uniqueResults.has(anime.id)) {
        uniqueResults.set(anime.id, {
          id: anime.id,
          name: anime.title || 'Sem nome',
          source: 'anime',
          description: anime.synopsis || 'Sem descrição disponível',
          status: anime.status === 'finished_airing' ? 'completed' : 'ongoing',
          main_picture: {
            medium: anime.main_picture?.medium,
            large: anime.main_picture?.large,
          },
          total_episode: anime.num_episodes || 0,
          total_season: 1,
        });
      }
    });
    
    return Array.from(uniqueResults.values());
  } catch (error) {
    console.error('Erro ao buscar animes:', error);
    return [];
  }
}

/**
 * Busca mangás na API oficial do MyAnimeList
 */
async function searchManga(query: string): Promise<ExternalStory[]> {
  try {
    const response = await fetch(
      `${MAL_CONFIG.API_URL}/manga?q=${encodeURIComponent(query)}&limit=100&fields=id,title,synopsis,num_chapters,num_volumes,status,main_picture,media_type`,
      {
        headers: {
          'X-MAL-CLIENT-ID': MAL_CONFIG.CLIENT_ID,
          'Authorization': `Bearer ${MAL_CONFIG.ACCESS_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Erro na API MAL:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return [];
    }
    
    // Remove duplicatas baseado no ID e retorna apenas os 100 primeiros resultados
    const uniqueResults = new Map();
    data.data.forEach((item: any) => {
      const manga = item.node;
      if (!uniqueResults.has(manga.id)) {
        const isManhwa = manga.media_type === 'manhwa';
        uniqueResults.set(manga.id, {
          id: manga.id,
          name: manga.title || 'Sem nome',
          source: isManhwa ? 'manhwa' : 'manga',
          description: manga.synopsis || 'Sem descrição disponível',
          status: manga.status === 'finished' ? 'completed' : 'ongoing',
          main_picture: {
            medium: manga.main_picture?.medium,
            large: manga.main_picture?.large,
          },
          total_chapter: manga.num_chapters !== null && manga.num_chapters !== undefined ? manga.num_chapters : 0,
          total_volume: manga.num_volumes !== null && manga.num_volumes !== undefined ? manga.num_volumes : 0,
        });
      }
    });
    
    return Array.from(uniqueResults.values());
  } catch (error) {
    console.error('Erro ao buscar mangás:', error);
    return [];
  }
}

/**
 * Busca séries na TMDB API (The Movie Database)
 * Nota: Requer API key gratuita
 */
async function searchTVShows(query: string): Promise<ExternalStory[]> {
  try {
    // API Key gratuita da TMDB (você pode criar sua própria em themoviedb.org)
    const API_KEY = '7247c6c7739aca0c3c270dcdd89192ff';
    
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
    );
    
    if (!response.ok) {
      console.log('TMDB API não disponível, usando busca local');
      return [];
    }

    const data = await response.json();
    
    return data.results.slice(0, 10).map((show: any) => ({
      id: show.id,
      name: show.name || show.original_name || 'Sem nome',
      source: 'series',
      description: show.overview || 'Sem descrição disponível',
      status: show.status === 'Ended' ? 'completed' : 'ongoing',
      main_picture: {
        medium: show.poster_path 
          ? `https://image.tmdb.org/t/p/w300${show.poster_path}` 
          : undefined,
        large: show.poster_path 
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}` 
          : undefined,
      },
      total_episode: show.number_of_episodes || 0,
      total_season: show.number_of_seasons || 0,
    }));
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    return [];
  }
}

/**
 * Busca em todas as APIs e retorna resultados combinados
 */
export async function searchAllContent(query: string): Promise<ExternalStory[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Busca em paralelo em todas as APIs
    const [animes, mangas, tvShows] = await Promise.all([
      searchAnime(query),
      searchManga(query),
      searchTVShows(query),
    ]);

    // Combina e ordena resultados
    const allResults = [...animes, ...mangas, ...tvShows];
    
    // Remove duplicados baseado no nome
    const uniqueResults = allResults.reduce((acc: ExternalStory[], current) => {
      const exists = acc.find(item => 
        item.name.toLowerCase() === current.name.toLowerCase() &&
        item.source === current.source
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueResults;
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return [];
  }
}

/**
 * Busca apenas animes
 */
export async function searchAnimeOnly(query: string): Promise<ExternalStory[]> {
  return searchAnime(query);
}

/**
 * Busca apenas mangás e manhwas
 */
export async function searchMangaOnly(query: string): Promise<ExternalStory[]> {
  return searchManga(query);
}

/**
 * Busca apenas séries
 */
export async function searchSeriesOnly(query: string): Promise<ExternalStory[]> {
  return searchTVShows(query);
}

export default {
  searchAllContent,
  searchAnimeOnly,
  searchMangaOnly,
  searchSeriesOnly,
};
