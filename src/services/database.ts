import * as SQLite from 'expo-sqlite';
import { User, Story, Bookmark } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('amsvault.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Tabela de usuários
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de stories
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mal_id INTEGER,
        name TEXT NOT NULL,
        source TEXT NOT NULL,
        description TEXT,
        total_season INTEGER DEFAULT 0,
        total_episode INTEGER DEFAULT 0,
        total_volume INTEGER DEFAULT 0,
        total_chapter INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ongoing',
        main_picture_medium TEXT,
        main_picture_large TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de bookmarks
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        story_id INTEGER NOT NULL,
        status TEXT DEFAULT 'watching',
        current_season INTEGER DEFAULT 0,
        current_episode INTEGER DEFAULT 0,
        current_volume INTEGER DEFAULT 0,
        current_chapter INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        UNIQUE(user_id, story_id)
      );
    `);

    // Índices para melhorar performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_story ON bookmarks(story_id);
      CREATE INDEX IF NOT EXISTS idx_stories_source ON stories(source);
    `);
  }

  // ==================== USER METHODS ====================

  async createUser(name: string, email: string, password: string): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    return {
      id: result.lastInsertRowId,
      name,
      email,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    return result || null;
  }

  async loginUser(email: string, password: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    return result || null;
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
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO stories (
        mal_id, name, source, description, total_season, total_episode,
        total_volume, total_chapter, status, main_picture_medium, main_picture_large
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        story.mal_id || null,
        story.name,
        story.source,
        story.description || '',
        story.total_season || 0,
        story.total_episode || 0,
        story.total_volume || 0,
        story.total_chapter || 0,
        story.status || 'ongoing',
        story.main_picture_medium || '',
        story.main_picture_large || '',
      ]
    );

    return result.lastInsertRowId;
  }

  async getStoryById(id: number): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM stories WHERE id = ?',
      [id]
    );

    return result || null;
  }

  async searchStories(name?: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    if (name) {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM stories WHERE name LIKE ? ORDER BY name',
        [`%${name}%`]
      );
      return results;
    }

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM stories ORDER BY name'
    );
    return results;
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
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.runAsync(
        `INSERT INTO bookmarks (
          user_id, story_id, status, current_season, current_episode,
          current_volume, current_chapter
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          bookmark.user_id,
          bookmark.story_id,
          bookmark.status || 'watching',
          bookmark.current_season || 0,
          bookmark.current_episode || 0,
          bookmark.current_volume || 0,
          bookmark.current_chapter || 0,
        ]
      );

      return result.lastInsertRowId;
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        throw new Error('Bookmark já existe');
      }
      throw error;
    }
  }

  async updateBookmark(id: number, updates: {
    status?: string;
    current_season?: number;
    current_episode?: number;
    current_volume?: number;
    current_chapter?: number;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.current_season !== undefined) {
      fields.push('current_season = ?');
      values.push(updates.current_season);
    }
    if (updates.current_episode !== undefined) {
      fields.push('current_episode = ?');
      values.push(updates.current_episode);
    }
    if (updates.current_volume !== undefined) {
      fields.push('current_volume = ?');
      values.push(updates.current_volume);
    }
    if (updates.current_chapter !== undefined) {
      fields.push('current_chapter = ?');
      values.push(updates.current_chapter);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.runAsync(
      `UPDATE bookmarks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async getBookmarksByUser(userId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      `SELECT 
        b.id,
        b.user_id,
        b.story_id,
        b.status,
        b.current_season,
        b.current_episode,
        b.current_volume,
        b.current_chapter,
        b.created_at,
        b.updated_at,
        s.id as 'story.id',
        s.mal_id as 'story.mal_id',
        s.name as 'story.name',
        s.source as 'story.source',
        s.description as 'story.description',
        s.total_season as 'story.total_season',
        s.total_episode as 'story.total_episode',
        s.total_volume as 'story.total_volume',
        s.total_chapter as 'story.total_chapter',
        s.status as 'story.status',
        s.main_picture_medium as 'story.main_picture_medium',
        s.main_picture_large as 'story.main_picture_large'
      FROM bookmarks b
      INNER JOIN stories s ON b.story_id = s.id
      WHERE b.user_id = ?
      ORDER BY b.updated_at DESC`,
      [userId]
    );

    // Transformar resultado flat em estrutura aninhada
    return results.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      story_id: row.story_id,
      status: row.status,
      current_season: row.current_season,
      current_episode: row.current_episode,
      current_volume: row.current_volume,
      current_chapter: row.current_chapter,
      created_at: row.created_at,
      updated_at: row.updated_at,
      story: {
        id: row['story.id'],
        mal_id: row['story.mal_id'],
        name: row['story.name'],
        source: row['story.source'],
        description: row['story.description'],
        total_season: row['story.total_season'],
        total_episode: row['story.total_episode'],
        total_volume: row['story.total_volume'],
        total_chapter: row['story.total_chapter'],
        status: row['story.status'],
        main_picture: {
          medium: row['story.main_picture_medium'],
          large: row['story.main_picture_large'],
        },
      },
    }));
  }

  async deleteBookmark(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM bookmarks WHERE id = ?', [id]);
  }

  // ==================== UTILITY METHODS ====================

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      DELETE FROM bookmarks;
      DELETE FROM stories;
      DELETE FROM users;
    `);
  }

  async seedInitialData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Verificar se já existem dados
    const existingUsers = await this.db.getFirstAsync<any>('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    // Criar usuário padrão
    const user = await this.createUser('Usuario Teste', 'teste@exemplo.com', '123456');

    // Criar alguns stories de exemplo
    const animeId = await this.createStory({
      name: 'One Piece',
      source: 'anime',
      description: 'Aventuras de Monkey D. Luffy em busca do One Piece',
      total_season: 1,
      total_episode: 1000,
      status: 'ongoing',
      main_picture_medium: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
      main_picture_large: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
    });

    const mangaId = await this.createStory({
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
