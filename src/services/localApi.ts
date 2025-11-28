import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, Bookmark } from '../types';

// Importação condicional baseada na plataforma
const DatabaseService = Platform.OS === 'web' 
  ? require('./database.web').default 
  : require('./database').default;

const USER_KEY = '@amsvault:user';

/**
 * LocalApiService - Substitui as chamadas da API por operações no banco local
 * Mantém a mesma interface do ApiService original para facilitar a migração
 */
class LocalApiService {
  private currentUser: User | null = null;

  // ==================== INICIALIZAÇÃO ====================

  async initialize(): Promise<void> {
    try {
      await DatabaseService.init();
      // Carregar usuário salvo, se existir
      const savedUser = await this.getUser();
      if (savedUser) {
        this.currentUser = savedUser;
      }
    } catch (error) {
      console.error('Error initializing LocalApiService:', error);
      throw error;
    }
  }

  // ==================== GERENCIAMENTO DE USUÁRIO ====================

  async saveUser(user: User): Promise<void> {
    this.currentUser = user;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    const userStr = await AsyncStorage.getItem(USER_KEY);
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    return this.currentUser;
  }

  async clearUser(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem(USER_KEY);
  }

  // ==================== AUTENTICAÇÃO ====================

  async login(email: string, password: string): Promise<{ user: User }> {
    const user = await DatabaseService.loginUser(email, password);
    
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    await this.saveUser(user);
    return { user };
  }

  async register(name: string, email: string, password: string): Promise<{ message: string; user: User }> {
    try {
      const user = await DatabaseService.createUser(name, email, password);
      await this.saveUser(user);
      return { message: 'Usuário criado com sucesso', user };
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        throw new Error('Email já cadastrado');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.clearUser();
  }

  // ==================== USUÁRIOS ====================

  async getCurrentUser(email?: string): Promise<User> {
    if (email) {
      const user = await DatabaseService.getUserByEmail(email);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      return user;
    }

    const user = await this.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user;
  }

  // ==================== STORIES ====================

  async getStories(name?: string): Promise<any[]> {
    return DatabaseService.searchStories(name);
  }

  async getStoryById(id: number): Promise<any> {
    const story = await DatabaseService.getStoryById(id);
    if (!story) {
      throw new Error('Story não encontrado');
    }
    return story;
  }

  async createStory(storyData: {
    name: string;
    source: string;
    description?: string;
    mal_id?: number;
    total_season?: number;
    total_episode?: number;
    total_volume?: number;
    total_chapter?: number;
    status?: string;
    main_picture_medium?: string;
    main_picture_large?: string;
  }): Promise<{ id: number }> {
    const id = await DatabaseService.createStory(storyData);
    return { id };
  }

  // ==================== BOOKMARKS ====================

  async getBookmarksByUser(userId: number): Promise<any[]> {
    return DatabaseService.getBookmarksByUser(userId);
  }

  async createBookmark(bookmarkData: {
    user_id: number;
    story_id: number;
    status?: string;
    current_season?: number;
    current_episode?: number;
    current_volume?: number;
    current_chapter?: number;
  }): Promise<{ id: number; message: string }> {
    try {
      const id = await DatabaseService.createBookmark(bookmarkData);
      return { id, message: 'Bookmark criado com sucesso' };
    } catch (error: any) {
      if (error.message?.includes('já existe')) {
        throw new Error('Este item já está nos seus favoritos');
      }
      throw error;
    }
  }

  async updateBookmark(bookmarkData: {
    id: string | number;
    user_id: number;
    story_id: number;
    status?: string;
    current_season?: number;
    current_episode?: number;
    current_volume?: number;
    current_chapter?: number;
  }): Promise<{ message: string }> {
    const id = typeof bookmarkData.id === 'string' ? parseInt(bookmarkData.id) : bookmarkData.id;
    
    await DatabaseService.updateBookmark(id, {
      status: bookmarkData.status,
      current_season: bookmarkData.current_season,
      current_episode: bookmarkData.current_episode,
      current_volume: bookmarkData.current_volume,
      current_chapter: bookmarkData.current_chapter,
    });

    return { message: 'Bookmark atualizado com sucesso' };
  }

  async deleteBookmark(id: number): Promise<{ message: string }> {
    await DatabaseService.deleteBookmark(id);
    return { message: 'Bookmark removido com sucesso' };
  }

  // ==================== UTILIDADES ====================

  async seedInitialData(): Promise<void> {
    await DatabaseService.seedInitialData();
  }

  async clearAllData(): Promise<void> {
    await DatabaseService.clearAllData();
    await this.clearUser();
  }
}

export default new LocalApiService();
