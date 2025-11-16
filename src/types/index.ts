// Tipos de dados da API AMSVault
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface MainPicture {
  Medium: string;
  Large: string;
}

export interface Story {
  ID: number;
  MALID?: number;
  Name: string;
  Source: string; // 'anime' | 'manga' | 'novel' | 'series'
  Description: string;
  TotalSeason: number;
  TotalEpisode: number;
  TotalVolume: number;
  TotalChapter: number;
  Status: string; // 'ongoing' | 'completed' | 'dropped'
  MainPicture: MainPicture;
}

export interface Bookmark {
  ID: string; // MongoDB ObjectID
  UserID: number;
  StoryID: number;
  Status: string; // 'watching' | 'reading' | 'completed' | 'dropped'
  CurrentSeason: number;
  CurrentEpisode: number;
  CurrentVolume: number;
  CurrentChapter: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string;
}

// Tipos para requisições da API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  acces_token: string;
  expiration: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateStoryRequest {
  name: string;
  mal_id?: number;
  source?: string;
  description?: string;
  total_season?: number;
  total_episode?: number;
  total_volume?: number;
  total_chapter?: number;
  status: string;
  main_picture?: {
    medium: string;
    large: string;
  };
}

export interface CreateBookmarkRequest {
  user_id: number;
  story_id: number;
  status?: string;
  current_season?: number;
  current_episode?: number;
  current_volume?: number;
  current_chapter?: number;
}

export interface UpdateBookmarkRequest {
  id: string;
  user_id: number;
  story_id: number;
  status?: string;
  current_season?: number;
  current_episode?: number;
  current_volume?: number;
  current_chapter?: number;
}

export interface ApiError {
  type: string;
  message: string;
  status_code: number;
}
