import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Story,
  Bookmark,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  ApiError,
} from '../types';
import { CONFIG } from '../config';
import { searchAnimeOnly } from './externalApi';

const TOKEN_KEY = '@amsvault:token';
const USER_KEY = '@amsvault:user';

class ApiService {
  private token: string | null = null;

  // Gerenciamento de token
  async saveToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }

  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Requisições HTTP usando XMLHttpRequest para evitar CORS preflight
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = await this.getToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = (options?.method as string) || 'GET';
      const url = `${CONFIG.API_BASE_URL}${endpoint}`;
      
      console.log('[fetchApi] Request:', { method, url, hasBody: !!options?.body });
      if (options?.body) {
        console.log('[fetchApi] Body content:', options.body);
        console.log('[fetchApi] Body type:', typeof options.body);
      }
      
      xhr.open(method, url, true);
      
      // SEMPRE configurar Content-Type como application/json quando houver body
      if (options?.body) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        console.log('[fetchApi] Header Content-Type set to: application/json');
      }
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        console.log('[fetchApi] Header Authorization set to: Bearer', token?.substring(0, 20) + '...');
      }
      
      console.log('[fetchApi] All headers configured');
      console.log('[fetchApi] Method:', method, 'URL:', url);

      xhr.onload = async () => {
        try {
          const data = JSON.parse(xhr.responseText);
          
          // Se for 401, token expirou
          if (xhr.status === 401) {
            await this.clearToken();
            reject(new Error('Sessão expirada. Faça login novamente.'));
            return;
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data as T);
          } else {
            const error = data as ApiError;
            reject(new Error(error.message || 'Erro na requisição'));
          }
        } catch (error) {
          reject(new Error('Erro ao processar resposta do servidor'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Erro de conexão com o servidor'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Tempo de requisição esgotado'));
      };

      xhr.timeout = CONFIG.REQUEST_TIMEOUT;

      // Enviar requisição
      const bodyToSend = options?.body as string || null;
      console.log('[fetchApi] Sending XHR with body:', bodyToSend);
      console.log('[fetchApi] Body is null?', bodyToSend === null);
      console.log('[fetchApi] Body length:', bodyToSend?.length);
      
      xhr.send(bodyToSend);
    });
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.fetchApi<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    await this.saveToken(response.acces_token);
    return response;
  }

  async register(userData: CreateUserRequest): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  // Usuários
  async getCurrentUser(email?: string): Promise<User> {
    console.log('[API] getCurrentUser called with email:', email);
    
    // Se email for fornecido, passa no body
    if (email) {
      const bodyData = { email: email.trim() }; // Remove espaços
      const bodyString = JSON.stringify(bodyData);
      console.log('[API] Sending GET /user with body string:', bodyString);
      console.log('[API] Body data object:', bodyData);
      console.log('[API] Email after trim:', email.trim());
      
      return this.fetchApi<User>('/user', {
        method: 'GET',
        body: bodyString,
      });
    }
    console.log('[API] Sending GET /user without body');
    return this.fetchApi<User>('/user');
  }

  async getUserById(id: number): Promise<User> {
    return this.fetchApi<User>(`/user/${id}`);
  }

  // Stories
  async getStories(name?: string): Promise<Story[]> {
    const query = name ? `?name=${encodeURIComponent(name)}` : '';
    return this.fetchApi<Story[]>(`/story${query}`);
  }

  async getStoryById(id: number): Promise<Story> {
    return this.fetchApi<Story>(`/story/${id}`);
  }

  /**
   * Busca animes diretamente da API do MyAnimeList
   * Melhor precisão e resultados mais completos
   */
  async searchAnimes(query: string): Promise<Story[]> {
    try {
      const externalAnimes = await searchAnimeOnly(query);
      
      // Converte os animes do formato externo para Story
      return externalAnimes.map(anime => ({
        ID: anime.id,
        MALID: anime.id,
        Name: anime.name,
        Description: anime.description,
        Source: anime.source,
        Image: anime.main_picture?.large || anime.main_picture?.medium || '',
        Genre: '',
        TotalSeason: anime.total_season || 0,
        TotalEpisode: anime.total_episode || 0,
        TotalVolume: 0,
        TotalChapter: 0,
        Status: anime.status,
        MainPicture: {
          Medium: anime.main_picture?.medium || '',
          Large: anime.main_picture?.large || '',
        },
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('[API] Error searching animes from MAL:', error);
      // Fallback para API local em caso de erro
      return this.getStories(query);
    }
  }

  // Bookmarks
  async getBookmarksByUser(userId: number): Promise<Bookmark[]> {
    return this.fetchApi<Bookmark[]>(`/bookmarks/user/${userId}`);
  }

  async getBookmarkById(id: string): Promise<Bookmark> {
    return this.fetchApi<Bookmark>(`/bookmarks/${id}`);
  }

  async createBookmark(data: CreateBookmarkRequest): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookmark(data: UpdateBookmarkRequest): Promise<Bookmark> {
    return this.fetchApi<Bookmark>(`/bookmarks/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBookmark(id: string): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>(`/bookmarks/${id}?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Helper: filtrar stories por tipo
  filterStoriesBySource(stories: Story[], source: string): Story[] {
    return stories.filter(story => 
      story.Source.toLowerCase() === source.toLowerCase()
    );
  }
}

export default new ApiService();
