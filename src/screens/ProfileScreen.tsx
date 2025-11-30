import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import LocalApiService from '../services/localApi';
import { Bookmark } from '../types';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'info';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await LocalApiService.getBookmarksByUser(user.id);
      setBookmarks(data);
    } catch (error) {
      showToast('Não foi possível carregar seus favoritos');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setShowLogoutConfirm(true);
  }

  function confirmLogout() {
    setShowLogoutConfirm(false);
    signOut();
    showToast('Logout realizado com sucesso', 'success');
  }

  function cancelLogout() {
    setShowLogoutConfirm(false);
  }

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Você precisa permitir acesso à galeria de fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      showToast('Foto de perfil atualizada!', 'success');
    }
  }

  if (!user) return null;

  // Contar bookmarks por status
  const watchingCount = bookmarks.filter(b => {
    const bookmark = b as any;
    return bookmark.status === 'watching';
  }).length;
  
  const readingCount = bookmarks.filter(b => {
    const bookmark = b as any;
    return bookmark.status === 'reading';
  }).length;
  
  const completedCount = bookmarks.filter(b => {
    const bookmark = b as any;
    return bookmark.status === 'completed';
  }).length;
  
  const droppedCount = bookmarks.filter(b => {
    const bookmark = b as any;
    return bookmark.status === 'dropped';
  }).length;
  
  const planCount = bookmarks.filter(b => {
    const bookmark = b as any;
    return bookmark.status === 'plan';
  }).length;

  return (
    <ScrollView style={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={pickImage}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        {loading ? (
          <ActivityIndicator color="#2563eb" />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{watchingCount}</Text>
              <Text style={styles.statLabel}>Assistindo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{readingCount}</Text>
              <Text style={styles.statLabel}>Lendo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{droppedCount}</Text>
              <Text style={styles.statLabel}>Dropado</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{planCount}</Text>
              <Text style={styles.statLabel}>Planos</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        {showLogoutConfirm ? (
          <View>
            <Text style={styles.confirmText}>Deseja realmente sair?</Text>
            <View style={styles.confirmButtons}>
              <Pressable style={styles.cancelButton} onPress={cancelLogout}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={confirmLogout}>
                <Text style={styles.logoutText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
