/**
 * MyAnimeList API Service
 * Documentação: https://myanimelist.net/apiconfig/references/api/v2
 */

export interface MALAnime {
  id: number;
  title: string;
  main_picture?: {
    medium: string;
    large: string;
  };
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_episodes?: number;
  status?: string;
  genres?: Array<{ id: number; name: string }>;
  media_type?: string;
  start_season?: {
    year: number;
    season: string;
  };
}

export interface MALSearchResponse {
  data: Array<{
    node: MALAnime;
  }>;
  paging?: {
    next?: string;
    previous?: string;
  };
}

class MyAnimeListService {
  private readonly BASE_URL = 'https://api.myanimelist.net/v2';
  private readonly CLIENT_ID = 'ad54544a8b8d50ae524bd6e2f552b62d';
  private readonly ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjhiZWEyMGRhMGEyNmVmYjhhYzk2Yjg3YTI1YjNkZWRmYTlmYWRhZmJhMTA3ODRlMzBhNzdhODZjNzc1MGE4YzI3ZTY4ODE0MmI1MWYyZDUzIn0.eyJhdWQiOiJhZDU0NTQ0YThiOGQ1MGFlNTI0YmQ2ZTJmNTUyYjYyZCIsImp0aSI6IjhiZWEyMGRhMGEyNmVmYjhhYzk2Yjg3YTI1YjNkZWRmYTlmYWRhZmJhMTA3ODRlMzBhNzdhODZjNzc1MGE4YzI3ZTY4ODE0MmI1MWYyZDUzIiwiaWF0IjoxNzYzMjY1MzM1LCJuYmYiOjE3NjMyNjUzMzUsImV4cCI6MTc2NTg1NzMzNSwic3ViIjoiNzczNzk0OCIsInNjb3BlcyI6W119.Ql_Igu2zSdr63WOICPKsGf7pVpNepMbUs5BaUAf77XouPISRmqiZLr3DcXQfyygYBzPpLBvhrEH9Hbp8oHfAcNAdvVcav5n5hFtQ5ZUf_-Ig1RjznJ__lpbNBor_xBDiEEaPSTvoM4JVpNcW9wevojU3M874hUVKWOyoH3cY3xECKd3cJGzrUtlBFREpjb0pNhRvxJMSyV93tfNuE3K61RQAz2qCf6tL7dZ7z-eemmN1rDk6qrDuE6s1H5KvZT4wxTMZc0UhgHFmMGsKVVslwEEkVypoogCIdr5wNl1pRPpUmbjQ7jQRVF9IXcO2o0AdrjvyvL9dDcVnU2ZitJ6KqQ';

  /**
   * Busca animes na API do MyAnimeList
   * @param query - Termo de busca
   * @param limit - Número máximo de resultados (padrão: 10)
   */
  async searchAnime(query: string, limit: number = 10): Promise<MALAnime[]> {
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const fields = [
        'id',
        'title',
        'main_picture',
        'alternative_titles',
        'synopsis',
        'mean',
        'rank',
        'popularity',
        'num_episodes',
        'status',
        'genres',
        'media_type',
        'start_season',
      ].join(',');

      const url = `${this.BASE_URL}/anime?q=${encodedQuery}&limit=${limit}&fields=${fields}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MAL-CLIENT-ID': this.CLIENT_ID,
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`MAL API Error: ${response.status} ${response.statusText}`);
      }

      const data: MALSearchResponse = await response.json();
      return data.data.map(item => item.node);
    } catch (error) {
      console.error('[MAL API] Search error:', error);
      throw error;
    }
  }

  /**
   * Busca anime por ID do MyAnimeList
   * @param malId - ID do anime no MAL
   */
  async getAnimeById(malId: number): Promise<MALAnime> {
    try {
      const fields = [
        'id',
        'title',
        'main_picture',
        'alternative_titles',
        'synopsis',
        'mean',
        'rank',
        'popularity',
        'num_episodes',
        'status',
        'genres',
        'media_type',
        'start_season',
      ].join(',');

      const url = `${this.BASE_URL}/anime/${malId}?fields=${fields}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MAL-CLIENT-ID': this.CLIENT_ID,
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`MAL API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[MAL API] Get by ID error:', error);
      throw error;
    }
  }

  /**
   * Converte anime do MAL para o formato Story da API local
   */
  convertToStory(malAnime: MALAnime) {
    return {
      mal_id: malAnime.id,
      name: malAnime.title,
      source: 'anime',
      description: malAnime.synopsis || '',
      total_season: 0, // MAL não tem seasons separadas
      total_episode: malAnime.num_episodes || 0,
      total_volume: 0,
      total_chapter: 0,
      status: this.convertStatus(malAnime.status),
      main_picture: malAnime.main_picture || {
        medium: '',
        large: '',
      },
    };
  }

  /**
   * Converte status do MAL para o formato da API local
   */
  private convertStatus(malStatus?: string): string {
    const statusMap: { [key: string]: string } = {
      'finished_airing': 'completed',
      'currently_airing': 'ongoing',
      'not_yet_aired': 'upcoming',
    };

    return statusMap[malStatus || ''] || 'unknown';
  }
}

export default new MyAnimeListService();
