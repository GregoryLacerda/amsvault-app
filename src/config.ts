/**
 * Configurações globais do app AMSVault
 */

export const CONFIG = {
  // URL da API Go - ajuste conforme seu ambiente
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:8080'  // Desenvolvimento (sem /api no final)
    : 'https://api.amsvault.com', // Produção
  
  // ID de usuário padrão (temporário - implementar autenticação depois)
  DEFAULT_USER_ID: '1',
  
  // Timeout para requisições (ms)
  REQUEST_TIMEOUT: 10000,
  
  // Paginação
  ITEMS_PER_PAGE: 20,
  
  // Tema
  COLORS: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textLight: '#666666',
    border: '#e0e0e0',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
  },
};
