import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import DatabaseSeedScreen from './DatabaseSeedScreen';

type ToastType = 'success' | 'error' | 'info';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showSeedModal, setShowSeedModal] = useState(false);

  const { signIn, signUp } = useAuth();

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  async function handleLogin() {
    if (!email || !password) {
      showToast('Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      showToast('Login realizado com sucesso!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name || !email || !password) {
      showToast('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password });
      showToast('Conta criada com sucesso!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>AMSVault</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Criar conta' : 'Bem-vindo de volta'}
        </Text>

        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={isRegistering ? handleRegister : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'Registrar' : 'Entrar'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => setIsRegistering(!isRegistering)}
          disabled={loading}
        >
          <Text style={styles.link}>
            {isRegistering
              ? 'Já tem conta? Faça login'
              : 'Não tem conta? Registre-se'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.devButton}
          onPress={() => setShowSeedModal(true)}
          disabled={loading}
        >
          <Text style={styles.devButtonText}>⚙️ Configurar Banco de Dados</Text>
        </Pressable>
      </View>

      <Modal
        visible={showSeedModal}
        animationType="slide"
        onRequestClose={() => setShowSeedModal(false)}
      >
        <View style={styles.modalContainer}>
          <DatabaseSeedScreen />
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowSeedModal(false)}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </Pressable>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  devButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  devButtonText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
