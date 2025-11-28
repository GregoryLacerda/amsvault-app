// Serviço para buscar dados de APIs externas (Jikan, TMDB, etc.)

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
 * Busca animes na Jikan API (MyAnimeList)
 */
async function searchAnime(query: string): Promise<ExternalStory[]> {
  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar animes');
    }

    const data = await response.json();
    
    return data.data.map((anime: any) => ({
      id: anime.mal_id,
      name: anime.title || anime.title_english || 'Sem nome',
      source: 'anime',
      description: anime.synopsis || 'Sem descrição disponível',
      status: anime.status === 'Finished Airing' ? 'completed' : 'ongoing',
      main_picture: {
        medium: anime.images?.jpg?.image_url,
        large: anime.images?.jpg?.large_image_url,
      },
      total_episode: anime.episodes || 0,
      total_season: 1,
    }));
  } catch (error) {
    console.error('Erro ao buscar animes:', error);
    return [];
  }
}

/**
 * Busca mangás na Jikan API (MyAnimeList)
 */
async function searchManga(query: string): Promise<ExternalStory[]> {
  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=10`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar mangás');
    }

    const data = await response.json();
    
    return data.data.map((manga: any) => ({
      id: manga.mal_id,
      name: manga.title || manga.title_english || 'Sem nome',
      source: manga.type === 'Manhwa' ? 'manhwa' : 'manga',
      description: manga.synopsis || 'Sem descrição disponível',
      status: manga.status === 'Finished' ? 'completed' : 'ongoing',
      main_picture: {
        medium: manga.images?.jpg?.image_url,
        large: manga.images?.jpg?.large_image_url,
      },
      total_chapter: manga.chapters || 0,
      total_volume: manga.volumes || 0,
    }));
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
