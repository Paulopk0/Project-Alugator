import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

const MessageDisplay = ({ message, type = 'error', onHide }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (message) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        styles[type],
        { opacity }
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  error: {
    backgroundColor: '#ff6b6b',
  },
  success: {
    backgroundColor: '#51cf66',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MessageDisplay;