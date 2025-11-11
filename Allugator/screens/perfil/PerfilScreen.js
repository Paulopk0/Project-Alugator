import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Tela de Perfil
        </Text>
        <Text style={styles.placeholderSubtext}>
          Esta tela será implementada posteriormente
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1DE9B6',
  },
  header: {
    height: '18%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444444',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444444',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});
