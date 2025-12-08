import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Story } from '../types';
import LocalApiService from '../services/localApi';
import ExternalApiService from '../services/externalApi';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import StatusSelectionModal from '../components/StatusSelectionModal';

type ToastType = 'success' | 'error' | 'info';

export default function HomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'anime' | 'manga' | 'manhwa' | 'series'>('all');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedAnimeForBookmark, setSelectedAnimeForBookmark] = useState<Story | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      let externalResults: any[] = [];
      
      // Busca em APIs externas baseado no filtro
      if (filterType === 'all') {
        externalResults = await ExternalApiService.searchAllContent(searchQuery);
      } else if (filterType === 'anime') {
        externalResults = await ExternalApiService.searchAnimeOnly(searchQuery);
      } else if (filterType === 'manga' || filterType === 'manhwa') {
        externalResults = await ExternalApiService.searchMangaOnly(searchQuery);
      } else if (filterType === 'series') {
        externalResults = await ExternalApiService.searchSeriesOnly(searchQuery);
      }
      
      // Também busca no banco local
      const localResults = await LocalApiService.getStories(searchQuery);
      
      // Filtra resultados locais pelo tipo se necessário
      const filteredLocalResults = filterType === 'all' 
        ? localResults 
        : localResults.filter((story: any) => {
            const source = (story.source || '').toLowerCase();
            if (filterType === 'anime') return source === 'anime';
            if (filterType === 'manga') return source === 'manga';
            if (filterType === 'manhwa') return source === 'manhwa';
            if (filterType === 'series') return source === 'series';
            return true;
          });
      
      // Combina resultados, priorizando externos (mais atualizados)
      const combinedResults = [...externalResults, ...filteredLocalResults];
      
      // Remove duplicados baseado no nome
      const uniqueResults = combinedResults.reduce((acc: any[], current: any) => {
        const exists = acc.find(item => 
          item.name?.toLowerCase() === current.name?.toLowerCase()
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      // Busca bookmarks do usuário para filtrar resultados já favoritados
      let filteredResults = uniqueResults;
      if (user) {
        try {
          const userBookmarks = await LocalApiService.getBookmarksByUser(user.id);
          const bookmarkedStoryNames = userBookmarks.map((b: any) => {
            const story = b.story;
            const name = (story?.name || story?.Name || '').toLowerCase();
            return name;
          }).filter(name => name !== '');
          
          // Remove stories que já estão nos favoritos
          filteredResults = uniqueResults.filter((story: any) => {
            const storyName = (story.name || story.Name || '').toLowerCase();
            return !bookmarkedStoryNames.includes(storyName);
          });
        } catch (error) {
          // Se falhar ao buscar bookmarks, mantém todos os resultados
          filteredResults = uniqueResults;
        }
      }
      
      setStories(filteredResults);
    } catch (error) {
      // Em caso de erro, tenta buscar apenas no banco local
      try {
        const localResults = await LocalApiService.getStories(searchQuery);
        setStories(localResults);
      } catch (localError) {
        setStories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnimeFromModal = async (status: string) => {
    setStatusModalVisible(false);
    
    if (selectedAnimeForBookmark) {
      await handleSaveBookmark(selectedAnimeForBookmark, status);
      setSelectedAnimeForBookmark(null);
    }
  };

  const handleSaveBookmark = async (story: Story, selectedStatus?: string) => {
    if (!user) {
      showToast('Você precisa estar logado para salvar favoritos', 'error');
      return;
    }

    const storyData = story as any;
    let storyId = storyData.id || storyData.ID || 0;
    const storyName = storyData.name || storyData.Name || 'story';

    setSavingBookmark(storyId);
    try {
      // Se a story não tem ID local (veio da API externa), salva primeiro
      if (!storyData.ID && storyData.id > 0) {
        const mainPicture = storyData.main_picture || {};
        
        const newStory = await LocalApiService.createStory({
          name: storyData.name,
          source: storyData.source || 'anime',
          description: storyData.description,
          mal_id: storyData.id,
          total_season: storyData.total_season || 0,
          total_episode: storyData.total_episode || 0,
          total_volume: storyData.total_volume || 0,
          total_chapter: storyData.total_chapter || 0,
          status: storyData.status || 'ongoing',
          main_picture_medium: mainPicture.medium,
          main_picture_large: mainPicture.large,
        });
        
        storyId = newStory.id;
      }
      
      const bookmarkData = {
        user_id: user.id,
        story_id: storyId,
        status: selectedStatus || (storyData.source === 'manga' || storyData.source === 'manhwa' ? 'reading' : 'watching'),
        current_season: 0,
        current_episode: 0,
        current_volume: 0,
        current_chapter: 0,
      };
      
      const result = await LocalApiService.createBookmark(bookmarkData);
      
      showToast(`✓ ${storyName} adicionado aos favoritos!`, 'success');
      
      // Remove o item da lista de resultados
      setStories(prevStories => prevStories.filter((s: any) => {
        const sName = (s.name || s.Name || '').toLowerCase();
        return sName !== storyName.toLowerCase();
      }));
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar favorito', 'error');
    } finally {
      setSavingBookmark(null);
    }
  };

  const renderStoryItem = ({ item }: { item: Story }) => {
    if (!item) {
      return null;
    }

    // API retorna em snake_case (minúsculas)
    const storyData = item as any;
    const id = storyData.id || storyData.ID || 0;
    const malId = storyData.mal_id || storyData.MALID || 0;
    const name = storyData.name || storyData.Name || 'Sem nome';
    const source = storyData.source || storyData.Source || 'N/A';
    const status = storyData.status || storyData.Status || 'N/A';
    const description = storyData.description || storyData.Description;
    const mainPicture = storyData.main_picture || storyData.MainPicture;
    const imageUrl = mainPicture?.medium || mainPicture?.Medium || null;

    // Se ambos IDs forem 0, não mostra o card
    if (id === 0 && malId === 0) {
      return null;
    }

    // Botão habilitado se id > 0 OU malId > 0
    const isButtonDisabled = savingBookmark === id || (id === 0 && malId === 0);

    return (
      <View style={styles.storyCard}>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.storyImage, { backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 40 }}>📺</Text>
              </View>
            )}
          </View>
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {name}
            </Text>
            <View style={styles.storyMeta}>
              <Text style={styles.storySource}>{source}</Text>
              <Text style={styles.storyStatus}>{status.replace('_', ' ')}</Text>
            </View>
            {description && (
              <Text style={styles.storyDescription} numberOfLines={3}>
                {description}
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                savingBookmark === id && styles.favoriteButtonDisabled,
              ]}
              onPress={() => {
                // Se for anime, abre o modal de seleção de status
                if (source.toLowerCase() === 'anime') {
                  setSelectedAnimeForBookmark(item);
                  setStatusModalVisible(true);
                } else {
                  // Para manga/manhwa/series, salva direto
                  handleSaveBookmark(item);
                }
              }}
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              {savingBookmark === id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.favoriteText}>Favoritar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar animes, mangás, séries..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '...' : '🔍'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'anime' && styles.filterButtonActive]}
          onPress={() => setFilterType('anime')}
        >
          <Text style={[styles.filterButtonText, filterType === 'anime' && styles.filterButtonTextActive]}>
            Animes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'manga' && styles.filterButtonActive]}
          onPress={() => setFilterType('manga')}
        >
          <Text style={[styles.filterButtonText, filterType === 'manga' && styles.filterButtonTextActive]}>
            Mangás
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'manhwa' && styles.filterButtonActive]}
          onPress={() => setFilterType('manhwa')}
        >
          <Text style={[styles.filterButtonText, filterType === 'manhwa' && styles.filterButtonTextActive]}>
            Manhwas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'series' && styles.filterButtonActive]}
          onPress={() => setFilterType('series')}
        >
          <Text style={[styles.filterButtonText, filterType === 'series' && styles.filterButtonTextActive]}>
            Séries
          </Text>
        </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      ) : searched && stories.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Nenhum resultado encontrado para "{searchQuery}"
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Digite um nome para buscar stories
          </Text>
        </View>
      ) : (
        <>
          <Text style={{ padding: 16, fontSize: 14, color: '#666' }}>
            {stories.length} resultado(s) encontrado(s)
          </Text>
          <FlatList
            data={stories}
            renderItem={renderStoryItem}
            keyExtractor={(item, index) => {
              const storyData = item as any;
              const id = storyData.id || storyData.ID;
              return id ? id.toString() : `story-${index}`;
            }}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {/* Modal de seleção de status para animes */}
      {selectedAnimeForBookmark && (
        <StatusSelectionModal
          visible={statusModalVisible}
          anime={selectedAnimeForBookmark}
          onClose={() => {
            setStatusModalVisible(false);
            setSelectedAnimeForBookmark(null);
          }}
          onConfirm={handleSelectAnimeFromModal}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  filterWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
    height: 32,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  storyImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  storyInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  storyMeta: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  storySource: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  storyStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  storyDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  favoriteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    zIndex: 10,
    elevation: 2,
  },
  favoriteButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  favoriteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
