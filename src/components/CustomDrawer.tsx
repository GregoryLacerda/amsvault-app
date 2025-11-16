import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { navigation, state } = props;

  const menuItems = [
    { name: 'Profile', label: 'Meu Perfil', icon: '👤' },
    { name: 'Animes', label: 'Animes', icon: '📺' },
    { name: 'Series', label: 'Séries', icon: '🎬' },
    { name: 'Mangas', label: 'Mangás', icon: '📚' },
  ];

  const currentRoute = state.routeNames[state.index];

  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/80?img=12' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>Usuário Demo</Text>
        <Text style={styles.userEmail}>usuario@amsvault.com</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <Pressable
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.name)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text
                style={[styles.menuLabel, isActive && styles.menuLabelActive]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>AMSVault v0.1.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menu: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#e0e7ff',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
  menuLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 'auto',
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
