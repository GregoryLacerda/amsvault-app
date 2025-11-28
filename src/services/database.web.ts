import { User, Story, Bookmark } from '../types';

/**
 * Web implementation usando localStorage
 * Simula banco de dados SQLite para ambiente web
 */
class DatabaseService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    try {
      // Verificar se localStorage está disponível
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage not available');
      }

      // Inicializar estruturas se não existirem
      if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
      }
      if (!localStorage.getItem('stories')) {
        localStorage.setItem('stories', JSON.stringify([]));
      }
      if (!localStorage.getItem('bookmarks')) {
        localStorage.setItem('bookmarks', JSON.stringify([]));
      }
      if (!localStorage.getItem('counters')) {
        localStorage.setItem('counters', JSON.stringify({ users: 0, stories: 0, bookmarks: 0 }));
      }

      this.initialized = true;
      console.log('Database (Web) initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private getUsers(): any[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  private setUsers(users: any[]) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  private getStories(): any[] {
    return JSON.parse(localStorage.getItem('stories') || '[]');
  }

  private setStories(stories: any[]) {
    localStorage.setItem('stories', JSON.stringify(stories));
  }

  private getBookmarks(): any[] {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
  }

  private setBookmarks(bookmarks: any[]) {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  private getCounters() {
    return JSON.parse(localStorage.getItem('counters') || '{"users":0,"stories":0,"bookmarks":0}');
  }

  private setCounters(counters: any) {
    localStorage.setItem('counters', JSON.stringify(counters));
  }

  private incrementCounter(type: 'users' | 'stories' | 'bookmarks'): number {
    const counters = this.getCounters();
    counters[type]++;
    this.setCounters(counters);
    return counters[type];
  }

  // ==================== USER METHODS ====================

  async createUser(name: string, email: string, password: string): Promise<User> {
    const users = this.getUsers();
    
    // Verificar se email já existe
    if (users.find(u => u.email === email)) {
      throw new Error('UNIQUE constraint failed: users.email');
    }

    const id = this.incrementCounter('users');
    const user = {
      id,
      name,
      email,
      password,
      created_at: new Date().toISOString(),
    };

    users.push(user);
    this.setUsers(users);

    return { id, name, email };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    return user ? { id: user.id, name: user.name, email: user.email } : null;
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user ? { id: user.id, name: user.name, email: user.email } : null;
  }

  // ==================== STORY METHODS ====================

  async createStory(story: {
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
  }): Promise<number> {
    const stories = this.getStories();
    const id = this.incrementCounter('stories');

    const newStory = {
      id,
      mal_id: story.mal_id || null,
      name: story.name,
      source: story.source,
      description: story.description || '',
      total_season: story.total_season || 0,
      total_episode: story.total_episode || 0,
      total_volume: story.total_volume || 0,
      total_chapter: story.total_chapter || 0,
      status: story.status || 'ongoing',
      main_picture_medium: story.main_picture_medium || '',
      main_picture_large: story.main_picture_large || '',
      created_at: new Date().toISOString(),
    };

    stories.push(newStory);
    this.setStories(stories);

    return id;
  }

  async getStoryById(id: number): Promise<any | null> {
    const stories = this.getStories();
    return stories.find(s => s.id === id) || null;
  }

  async searchStories(name?: string): Promise<any[]> {
    const stories = this.getStories();
    
    if (name) {
      return stories.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
    }

    return stories.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ==================== BOOKMARK METHODS ====================

  async createBookmark(bookmark: {
    user_id: number;
    story_id: number;
    status?: string;
    current_season?: number;
    current_episode?: number;
    current_volume?: number;
    current_chapter?: number;
  }): Promise<number> {
    const bookmarks = this.getBookmarks();

    // Verificar se já existe
    const exists = bookmarks.find(
      b => b.user_id === bookmark.user_id && b.story_id === bookmark.story_id
    );
    if (exists) {
      throw new Error('Bookmark já existe');
    }

    const id = this.incrementCounter('bookmarks');
    const now = new Date().toISOString();

    const newBookmark = {
      id,
      user_id: bookmark.user_id,
      story_id: bookmark.story_id,
      status: bookmark.status || 'watching',
      current_season: bookmark.current_season || 0,
      current_episode: bookmark.current_episode || 0,
      current_volume: bookmark.current_volume || 0,
      current_chapter: bookmark.current_chapter || 0,
      created_at: now,
      updated_at: now,
    };

    bookmarks.push(newBookmark);
    this.setBookmarks(bookmarks);

    return id;
  }

  async updateBookmark(id: number, updates: {
    status?: string;
    current_season?: number;
    current_episode?: number;
    current_volume?: number;
    current_chapter?: number;
  }): Promise<void> {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.id === id);

    if (index === -1) return;

    bookmarks[index] = {
      ...bookmarks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.setBookmarks(bookmarks);
  }

  async getBookmarksByUser(userId: number): Promise<any[]> {
    const bookmarks = this.getBookmarks();
    const stories = this.getStories();

    const userBookmarks = bookmarks
      .filter(b => b.user_id === userId)
      .map(bookmark => {
        const story = stories.find(s => s.id === bookmark.story_id);
        return {
          id: bookmark.id,
          user_id: bookmark.user_id,
          story_id: bookmark.story_id,
          status: bookmark.status,
          current_season: bookmark.current_season,
          current_episode: bookmark.current_episode,
          current_volume: bookmark.current_volume,
          current_chapter: bookmark.current_chapter,
          created_at: bookmark.created_at,
          updated_at: bookmark.updated_at,
          story: story ? {
            id: story.id,
            mal_id: story.mal_id,
            name: story.name,
            source: story.source,
            description: story.description,
            total_season: story.total_season,
            total_episode: story.total_episode,
            total_volume: story.total_volume,
            total_chapter: story.total_chapter,
            status: story.status,
            main_picture: {
              medium: story.main_picture_medium,
              large: story.main_picture_large,
            },
          } : null,
        };
      })
      .filter(b => b.story !== null)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return userBookmarks;
  }

  async deleteBookmark(id: number): Promise<void> {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    this.setBookmarks(filtered);
  }

  // ==================== UTILITY METHODS ====================

  async clearAllData(): Promise<void> {
    localStorage.setItem('users', JSON.stringify([]));
    localStorage.setItem('stories', JSON.stringify([]));
    localStorage.setItem('bookmarks', JSON.stringify([]));
    localStorage.setItem('counters', JSON.stringify({ users: 0, stories: 0, bookmarks: 0 }));
  }

  async seedInitialData(): Promise<void> {
    const users = this.getUsers();
    if (users.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    // Criar usuário padrão
    const user = await this.createUser('Usuario Teste', 'teste@exemplo.com', '123456');

    // Criar stories de exemplo
    await this.createStory({
      name: 'One Piece',
      source: 'anime',
      description: 'Aventuras de Monkey D. Luffy em busca do One Piece',
      total_season: 1,
      total_episode: 1000,
      status: 'ongoing',
      main_picture_medium: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
    });

    await this.createStory({
      name: 'Naruto',
      source: 'manga',
      description: 'História de Naruto Uzumaki',
      total_volume: 72,
      total_chapter: 700,
      status: 'completed',
      main_picture_medium: 'https://cdn.myanimelist.net/images/manga/3/117681.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/manga/3/117681l.jpg',
    });

    await this.createStory({
      name: 'Attack on Titan',
      source: 'anime',
      description: 'Humanidade luta contra titãs',
      total_season: 4,
      total_episode: 87,
      status: 'completed',
      main_picture_medium: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    });

    await this.createStory({
      name: 'Death Note',
      source: 'anime',
      description: 'Light Yagami encontra um caderno da morte',
      total_season: 1,
      total_episode: 37,
      status: 'completed',
      main_picture_medium: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/anime/9/9453l.jpg',
    });

    await this.createStory({
      name: 'Breaking Bad',
      source: 'series',
      description: 'Professor de química vira produtor de metanfetamina',
      total_season: 5,
      total_episode: 62,
      status: 'completed',
      main_picture_medium: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      main_picture_large: 'https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    });

    await this.createStory({
      name: 'Game of Thrones',
      source: 'series',
      description: 'Casas nobres lutam pelo Trono de Ferro',
      total_season: 8,
      total_episode: 73,
      status: 'completed',
      main_picture_medium: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      main_picture_large: 'https://image.tmdb.org/t/p/original/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    });

    await this.createStory({
      name: 'Berserk',
      source: 'manga',
      description: 'Guts, o Espadachim Negro, busca vingança',
      total_volume: 41,
      total_chapter: 370,
      status: 'ongoing',
      main_picture_medium: 'https://cdn.myanimelist.net/images/manga/1/157897.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg',
    });

    await this.createStory({
      name: 'Tokyo Ghoul',
      source: 'manga',
      description: 'Kaneki se torna meio-ghoul após acidente',
      total_volume: 14,
      total_chapter: 143,
      status: 'completed',
      main_picture_medium: 'https://cdn.myanimelist.net/images/manga/3/54525.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/manga/3/54525l.jpg',
    });

    console.log('Initial data seeded successfully');
  }
}

export default new DatabaseService();
