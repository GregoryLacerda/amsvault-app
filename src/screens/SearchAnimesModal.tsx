import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchAnimeOnly } from '../services/externalApi';
import { Story } from '../types';

interface SearchAnimesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAnime: (anime: Story, status: string) => void;
}

export default function SearchAnimesModal({ visible, onClose, onSelectAnime }: SearchAnimesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    anime: Story | null;
  }>({ visible: false, anime: null });
  const [selectedStatus, setSelectedStatus] = useState('watching');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    
    // Timeout de 10 segundos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Busca demorou mais de 10 segundos')), 10000);
    });

    try {
      const searchPromise = searchAnimeOnly(searchQuery);
      const externalAnimes = await Promise.race([searchPromise, timeoutPromise]);
      
      // Converte para formato Story
      const animes: Story[] = externalAnimes.map(anime => ({
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
      
      setResults(animes);
    } catch (error: any) {
      if (error?.message?.includes('Timeout')) {
        // Se deu timeout, retorna array vazio
      }
      
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setSearched(false);
    setConfirmModal({ visible: false, anime: null });
    setSelectedStatus('watching');
    onClose();
  };

  const handleOpenConfirmModal = (anime: Story) => {
    setConfirmModal({ visible: true, anime });
    setSelectedStatus('watching');
  };

  const handleConfirmAdd = () => {
    if (confirmModal.anime) {
      onSelectAnime(confirmModal.anime, selectedStatus);
      setConfirmModal({ visible: false, anime: null });
      setSelectedStatus('watching');
      handleClose();
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModal({ visible: false, anime: null });
    setSelectedStatus('watching');
  };

  const renderAnimeItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.animeItem}
      onPress={() => handleOpenConfirmModal(item)}
    >
      {item.Image ? (
        <Image source={{ uri: item.Image }} style={styles.animeImage} />
      ) : (
        <View style={[styles.animeImage, styles.placeholderImage]}>
          <Ionicons name="film-outline" size={40} color="#999" />
        </View>
      )}
      <View style={styles.animeInfo}>
        <Text style={styles.animeName} numberOfLines={2}>{item.Name}</Text>
        {item.Genre && (
          <Text style={styles.animeGenre} numberOfLines={1}>{item.Genre}</Text>
        )}
        {item.Description && (
          <Text style={styles.animeDescription} numberOfLines={2}>{item.Description}</Text>
        )}
      </View>
      <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar Anime</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do anime..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Buscando animes...</Text>
            </View>
          ) : searched && results.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum anime encontrado</Text>
              <Text style={styles.emptySubtext}>Tente buscar com outro termo</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.ID.toString()}
              renderItem={renderAnimeItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Modal de Confirmação */}
      <Modal
        visible={confirmModal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancelConfirm}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Adicionar aos Favoritos</Text>
            
            {confirmModal.anime && (
              <View style={styles.confirmAnimeInfo}>
                {confirmModal.anime.Image ? (
                  <Image 
                    source={{ uri: confirmModal.anime.Image }} 
                    style={styles.confirmAnimeImage} 
                  />
                ) : (
                  <View style={[styles.confirmAnimeImage, styles.placeholderImage]}>
                    <Ionicons name="film-outline" size={30} color="#999" />
                  </View>
                )}
                <Text style={styles.confirmAnimeName} numberOfLines={2}>
                  {confirmModal.anime.Name}
                </Text>
              </View>
            )}

            <Text style={styles.statusLabel}>Selecione o status:</Text>
            
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'watching' && styles.statusOptionActive,
                ]}
                onPress={() => setSelectedStatus('watching')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'watching' && styles.statusOptionTextActive,
                  ]}
                >
                  Assistindo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'completed' && styles.statusOptionActive,
                ]}
                onPress={() => setSelectedStatus('completed')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'completed' && styles.statusOptionTextActive,
                  ]}
                >
                  Completo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'dropped' && styles.statusOptionActive,
                ]}
                onPress={() => setSelectedStatus('dropped')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'dropped' && styles.statusOptionTextActive,
                  ]}
                >
                  Dropado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  selectedStatus === 'plan' && styles.statusOptionActive,
                ]}
                onPress={() => setSelectedStatus('plan')}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === 'plan' && styles.statusOptionTextActive,
                  ]}
                >
                  Plano de Assistir
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.confirmModalCancelButton}
                onPress={handleCancelConfirm}
              >
                <Text style={styles.confirmModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmModalConfirmButton}
                onPress={handleConfirmAdd}
              >
                <Text style={styles.confirmModalConfirmText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  animeItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animeImage: {
    width: 80,
    height: 112,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animeInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  animeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  animeGenre: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 4,
  },
  animeDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  // Modal de confirmação
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmAnimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  confirmAnimeImage: {
    width: 60,
    height: 84,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  confirmAnimeName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusOptions: {
    gap: 8,
    marginBottom: 20,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  statusOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  statusOptionTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  confirmModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  confirmModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
