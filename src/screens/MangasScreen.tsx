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

export default function MangasScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksWithStories, setBookmarksWithStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<{ id: string; chapter: number; status: string } | null>(null);
  const [descriptionModal, setDescriptionModal] = useState<{ visible: boolean; title: string; description: string }>({ visible: false, title: '', description: '' });
  const [sortBy, setSortBy] = useState<'all' | 'reading' | 'completed' | 'dropped'>('all');
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMangas();
    }, [user])
  );

  useEffect(() => {
    handleSearch();
  }, [sortBy]);

  const loadMangas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userBookmarks = await LocalApiService.getBookmarksByUser(user.id);
      setBookmarks(userBookmarks);

      // Filtra bookmarks que são mangás
      const mangaBookmarks = userBookmarks.filter((bookmark: any) => {
        const story = bookmark.story;
        if (!story) return false;
        const source = (story.source || story.Source || '').toLowerCase();
        return source === 'manga';
      });
      
      setBookmarksWithStories(mangaBookmarks);
    } catch (error) {
      showToast('Não foi possível carregar os mangás');
      setBookmarksWithStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim() && sortBy === 'all') {
      loadMangas();
      return;
    }
    
    let filtered = bookmarks.filter((bookmark: any) => {
      const story = bookmark.story;
      if (!story) return false;
      const source = (story.source || story.Source || '').toLowerCase();
      return source === 'manga';
    });

    if (sortBy !== 'all') {
      filtered = filtered.filter((bookmark: any) => bookmark.status === sortBy);
    }

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
        current_chapter: editingBookmark.chapter,
        current_volume: (bookmark as any).current_volume || 0,
      });

      // Atualiza localmente
      const updated = bookmarksWithStories.map((b: any) => {
        if (b.id === editingBookmark.id) {
          return { ...b, current_chapter: editingBookmark.chapter, status: editingBookmark.status };
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

  const renderManga = ({ item, index }: { item: any; index: number }) => {
    const bookmark = item;
    const story = bookmark.story;
    if (!story) return null;

    const name = story.name || story.Name || 'Sem nome';
    const description = story.description || story.Description || 'Sem descrição';
    const mainPicture = story.main_picture || story.MainPicture;
    const imageUrl = mainPicture?.large || mainPicture?.Large || mainPicture?.medium || mainPicture?.Medium;
    const totalChapter = story.total_chapter || story.TotalChapter || 0;
    const totalVolume = story.total_volume || story.TotalVolume || 0;
    
    const isEditing = editingBookmark?.id === bookmark.id;
    const currentChapter = isEditing ? (editingBookmark?.chapter ?? 0) : (bookmark.current_chapter || 0);
    const bookmarkStatus = isEditing ? (editingBookmark?.status ?? 'reading') : (bookmark.status || 'reading');

    const statusOptions = [
      { value: 'reading', label: 'Lendo' },
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
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setDescriptionModal({ visible: true, title: name, description })}
            >
              <Text style={styles.infoButtonText}>i</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Capítulo:</Text>
            <TextInput
              style={styles.chapterInput}
              value={currentChapter.toString()}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({ 
                    index, 
                    animated: true,
                    viewPosition: 0.3
                  });
                }, 100);
              }}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                if (num >= 0) {
                  setEditingBookmark({ id: bookmark.id, chapter: num, status: bookmarkStatus });
                }
              }}
              keyboardType="numeric"
            />
            <Text style={styles.progressText}>de {totalChapter || '?'}</Text>
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
                      chapter: currentChapter, 
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
          placeholder="Buscar mangás..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={styles.sortWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortContainer}>
        <TouchableOpacity style={[styles.sortButton, sortBy === 'all' && styles.sortButtonActive]} onPress={() => setSortBy('all')}>
          <Text style={[styles.sortButtonText, sortBy === 'all' && styles.sortButtonTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortButton, sortBy === 'reading' && styles.sortButtonActive]} onPress={() => setSortBy('reading')}>
          <Text style={[styles.sortButtonText, sortBy === 'reading' && styles.sortButtonTextActive]}>Lendo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortButton, sortBy === 'completed' && styles.sortButtonActive]} onPress={() => setSortBy('completed')}>
          <Text style={[styles.sortButtonText, sortBy === 'completed' && styles.sortButtonTextActive]}>Completo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortButton, sortBy === 'dropped' && styles.sortButtonActive]} onPress={() => setSortBy('dropped')}>
          <Text style={[styles.sortButtonText, sortBy === 'dropped' && styles.sortButtonTextActive]}>Dropado</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : bookmarksWithStories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum mangá encontrado</Text>
          <Text style={styles.emptyHint}>Tente buscar por nome</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={bookmarksWithStories}
          renderItem={renderManga}
          keyExtractor={(item, index) => {
            return item.id || `manga-${index}`;
          }}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onScrollToIndexFailed={(info) => {
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
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDescriptionModal({ visible: false, title: '', description: '' })}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setDescriptionModal({ visible: false, title: '', description: '' })}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
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
          </Pressable>
        </Pressable>
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
  sortWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  sortContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  sortButton: { paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', minWidth: 75, height: 32 },
  sortButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  sortButtonText: { fontSize: 12, color: '#666', fontWeight: '600' },
  sortButtonTextActive: { color: '#fff' },
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
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
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  chapterInput: {
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
    gap: 8,
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
