import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
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
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
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
              <Text style={styles.statLabel}>Completos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{droppedCount}</Text>
              <Text style={styles.statLabel}>Dropados</Text>
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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  email: {
    fontSize: 16,
    color: '#666',
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
