/**
 * PasswordSuccessScreen - Tela de sucesso pós-mudança de senha
 * Design: 8.2 - C - Mudar senha (Loading)
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  background: '#1DE9B6',
  text: '#FFFFFF',
};

export default function PasswordSuccessScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Security');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark-content" />
      <ActivityIndicator size="large" color={COLORS.text} />
      <Text style={styles.successText}>A Senha Foi Alterada Com Sucesso!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});