import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Story } from '../types';

interface StatusSelectionModalProps {
  visible: boolean;
  anime: Story;
  onClose: () => void;
  onConfirm: (status: string) => void;
}

export default function StatusSelectionModal({ visible, anime, onClose, onConfirm }: StatusSelectionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('watching');

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Adicionar aos Favoritos</Text>
          
          <View style={styles.animeInfo}>
            {anime.Image ? (
              <Image 
                source={{ uri: anime.Image }} 
                style={styles.animeImage} 
              />
            ) : (
              <View style={[styles.animeImage, styles.placeholderImage]}>
                <Ionicons name="film-outline" size={30} color="#999" />
              </View>
            )}
            <Text style={styles.animeName} numberOfLines={2}>
              {anime.Name}
            </Text>
          </View>

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

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  animeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  animeImage: {
    width: 60,
    height: 84,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animeName: {
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
