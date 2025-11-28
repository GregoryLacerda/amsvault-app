import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import LocalApiService from '../services/localApi';

/**
 * Componente de desenvolvimento para popular o banco com dados de exemplo
 * Útil para testes iniciais
 */
export default function DatabaseSeedScreen() {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      await LocalApiService.seedInitialData();
      Alert.alert('Sucesso', 'Dados de exemplo criados com sucesso!\n\nLogin:\nEmail: teste@exemplo.com\nSenha: 123456');
      setInitialized(true);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar dados de exemplo');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente limpar todos os dados do banco?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await LocalApiService.clearAllData();
              Alert.alert('Sucesso', 'Todos os dados foram removidos');
              setInitialized(false);
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao limpar dados');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuração do Banco de Dados</Text>
      <Text style={styles.subtitle}>
        Use esta tela para popular o banco com dados de exemplo para testes
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : (
        <>
          <Pressable style={styles.button} onPress={handleSeedData}>
            <Text style={styles.buttonText}>Criar Dados de Exemplo</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.dangerButton]} onPress={handleClearData}>
            <Text style={styles.buttonText}>Limpar Todos os Dados</Text>
          </Pressable>

          {initialized && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>✅ Banco inicializado com sucesso!</Text>
              <Text style={styles.credentialsText}>
                Login de teste:{'\n'}
                Email: teste@exemplo.com{'\n'}
                Senha: 123456
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 20,
  },
  loader: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 12,
  },
  credentialsText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});
