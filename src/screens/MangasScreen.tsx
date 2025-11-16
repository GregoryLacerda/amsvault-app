import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Story } from '../types';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'info';

export default function MangasScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const { user } = useAuth();

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadMangas();
  }, []);

  const loadMangas = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const allStories = await ApiService.getStories(searchTerm);
      const mangas = ApiService.filterStoriesBySource(allStories, 'manga');
      setStories(mangas);
    } catch (error) {
      showToast('Não foi possível carregar os mangás');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadMangas(search);
  };

  const handleAddBookmark = async (story: Story) => {
    if (!user) return;
    
    try {
      await ApiService.createBookmark({
        user_id: user.id,
        story_id: story.ID,
        status: 'reading',
        current_chapter: 0,
        current_volume: 0,
      });
      showToast(`${story.Name} adicionado!`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao adicionar');
    }
  };

  const renderManga = ({ item }: { item: Story }) => (
    <Pressable style={styles.card} onPress={() => handleAddBookmark(item)}>
      <Image 
        source={{ uri: item.MainPicture?.Large || item.MainPicture?.Medium || 'https://via.placeholder.com/100x140' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.Name}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.Description || 'Sem descrição'}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.episodes}>
            {item.TotalVolume} vols • {item.TotalChapter} caps
          </Text>
          <Text
            style={[
              styles.status,
              item.Status === 'ongoing' ? styles.statusOngoing : styles.statusCompleted,
            ]}
          >
            {item.Status === 'ongoing' ? 'Em andamento' : 'Completo'}
          </Text>
        </View>
      </View>
    </Pressable>
  );

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

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : stories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum mangá encontrado</Text>
          <Text style={styles.emptyHint}>Tente buscar por nome</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderManga}
          keyExtractor={(item) => item.ID.toString()}
          contentContainerStyle={styles.list}
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
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
