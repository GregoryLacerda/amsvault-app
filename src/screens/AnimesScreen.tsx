import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Story, Bookmark } from '../types';
import LocalApiService from '../services/localApi';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'info';

export default function AnimesScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksWithStories, setBookmarksWithStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<{ id: string; episode: number; status: string } | null>(null);
  const [descriptionModal, setDescriptionModal] = useState<{ visible: boolean; title: string; description: string }>({ visible: false, title: '', description: '' });
  const [sortBy, setSortBy] = useState<'all' | 'watching' | 'completed' | 'dropped'>('all');
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAnimes();
    }, [user])
  );

  useEffect(() => {
    handleSearch();
  }, [sortBy]);

  const loadAnimes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Busca os bookmarks do usuário (já retorna os dados do story)
      const userBookmarks = await LocalApiService.getBookmarksByUser(user.id);
      setBookmarks(userBookmarks);

      // Filtra bookmarks que são animes
      const animeBookmarks = userBookmarks.filter(bookmark => {
        const bookmarkData = bookmark as any;
        const story = bookmarkData.story;
        if (!story) return false;
        const source = story.source || story.Source || '';
        return source.toLowerCase() === 'anime';
      });
      
      setBookmarksWithStories(animeBookmarks);
    } catch (error) {
      showToast('Não foi possível carregar os animes');
      setBookmarksWithStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim() && sortBy === 'all') {
      loadAnimes();
      return;
    }
    
    // Filtra os bookmarks já carregados
    let filtered = bookmarks.filter(bookmark => {
      const bookmarkData = bookmark as any;
      const story = bookmarkData.story;
      if (!story) return false;
      const source = (story.source || story.Source || '').toLowerCase();
      return source === 'anime';
    });

    // Filtro por status
    if (sortBy !== 'all') {
      filtered = filtered.filter(bookmark => {
        const bookmarkData = bookmark as any;
        return bookmarkData.status === sortBy;
      });
    }

    // Filtro por busca
    if (search.trim()) {
      filtered = filtered.filter(bookmark => {
        const story = (bookmark as any).story;
        const name = story?.name || story?.Name || '';
        return name.toLowerCase().includes(search.toLowerCase());
      });
    }
    
    setBookmarksWithStories(filtered);
  };

  const handleConfirmUpdate = async () => {
    if (!editingBookmark || !user) return;

    try {
      const bookmark = bookmarksWithStories.find((b: any) => b.id === editingBookmark.id);
      if (!bookmark) return;

      await LocalApiService.updateBookmark({
        id: editingBookmark.id,
        user_id: user.id,
        story_id: (bookmark as any).story.id,
        status: editingBookmark.status,
        current_episode: editingBookmark.episode,
        current_season: (bookmark as any).current_season || 0,
      });

      // Atualiza localmente
      const updated = bookmarksWithStories.map((b: any) => {
        if (b.id === editingBookmark.id) {
          return { ...b, current_episode: editingBookmark.episode, status: editingBookmark.status };
        }
        return b;
      });
      setBookmarksWithStories(updated);
      setEditingBookmark(null);
      showToast('Atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar');
    }
  };

  const handleDelete = async (bookmarkId: string) => {
    if (!user) return;

    try {
      await LocalApiService.deleteBookmark(bookmarkId);
      const updated = bookmarksWithStories.filter((b: any) => b.id !== bookmarkId);
      setBookmarksWithStories(updated);
      showToast('Removido dos favoritos!', 'success');
    } catch (error) {
      showToast('Erro ao remover');
    }
  };

  const renderAnime = ({ item, index }: { item: any; index: number }) => {
    const bookmark = item;
    const story = bookmark.story;
    if (!story) return null;

    const name = story.name || story.Name || 'Sem nome';
    const description = story.description || story.Description || 'Sem descrição';
    const mainPicture = story.main_picture || story.MainPicture;
    const imageUrl = mainPicture?.large || mainPicture?.Large || mainPicture?.medium || mainPicture?.Medium;
    const totalEpisode = story.total_episode || story.TotalEpisode || 0;
    const totalSeason = story.total_season || story.TotalSeason || 0;
    
    const isEditing = editingBookmark?.id === bookmark.id;
    const currentEpisode = isEditing ? (editingBookmark?.episode ?? 0) : (bookmark.current_episode || 0);
    const bookmarkStatus = isEditing ? (editingBookmark?.status ?? 'watching') : (bookmark.status || 'watching');

    const statusOptions = [
      { value: 'watching', label: 'Assistindo' },
      { value: 'completed', label: 'Completo' },
      { value: 'dropped', label: 'Dropado' },
    ];

    return (
      <Pressable style={styles.card}>
        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/100x140' }} 
          style={styles.image} 
        />
        <View style={styles.info}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setDescriptionModal({ visible: true, title: name, description })}
              >
                <Text style={styles.infoButtonText}>i</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(bookmark.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Episódio:</Text>
            <TextInput
              style={styles.episodeInput}
              value={currentEpisode.toString()}
              onFocus={() => {
                // Scroll para o item quando o teclado abrir
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({ 
                    index, 
                    animated: true,
                    viewPosition: 0.3 // Posiciona o item a 30% da tela
                  });
                }, 100);
              }}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                if (num >= 0) {
                  setEditingBookmark({ id: bookmark.id, episode: num, status: bookmarkStatus });
                }
              }}
              keyboardType="numeric"
            />
            <Text style={styles.progressText}>de {totalEpisode || '?'}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={styles.statusButtons}>
              {statusOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusButton,
                    bookmarkStatus === option.value && styles.statusButtonActive
                  ]}
                  onPress={() => {
                    setEditingBookmark({ 
                      id: bookmark.id, 
                      episode: currentEpisode, 
                      status: option.value 
                    });
                  }}
                >
                  <Text style={[
                    styles.statusButtonText,
                    bookmarkStatus === option.value && styles.statusButtonTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmUpdate}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
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
          placeholder="Buscar animes..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={styles.sortWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'all' && styles.sortButtonActive]}
          onPress={() => setSortBy('all')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'all' && styles.sortButtonTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'watching' && styles.sortButtonActive]}
          onPress={() => setSortBy('watching')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'watching' && styles.sortButtonTextActive]}>Assistindo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'completed' && styles.sortButtonActive]}
          onPress={() => setSortBy('completed')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'completed' && styles.sortButtonTextActive]}>Completo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'dropped' && styles.sortButtonActive]}
          onPress={() => setSortBy('dropped')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'dropped' && styles.sortButtonTextActive]}>Dropado</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : bookmarksWithStories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum anime encontrado</Text>
          <Text style={styles.emptyHint}>Tente buscar por nome</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={bookmarksWithStories}
          renderItem={renderAnime}
          keyExtractor={(item, index) => {
            return item.id || `anime-${index}`;
          }}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onScrollToIndexFailed={(info) => {
            // Fallback caso o scroll falhe
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ 
                index: info.index, 
                animated: true,
                viewPosition: 0.3 
              });
            });
          }}
        />
      )}

      <Modal
        visible={descriptionModal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDescriptionModal({ visible: false, title: '', description: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{descriptionModal.title}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalDescription}>{descriptionModal.description}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDescriptionModal({ visible: false, title: '', description: '' })}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  sortWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  sortButton: {
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
  sortButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 140,
  },
  info: {
    flex: 1,
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statusButtonText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  episodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeInput: {
    width: 50,
    height: 28,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 4,
    paddingHorizontal: 6,
    fontSize: 12,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
  episodeTotal: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 4,
  },
  episodes: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  rating: {
    fontSize: 12,
    color: '#333',
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOngoing: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  statusCompleted: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  },
});
