import { StyleSheet } from 'react-native';

// Cores baseadas no seu design do Figma
const COLORS = {
  primary: '#1DE9B6',
  darkText: '#333333',
};

/**
 * Folha de estilos para o componente CustomButton.
 * Segue o padrão de separar o estilo do componente, como visto no PDF.
 */
export default StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginVertical: 8,
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 2 },
    boxShadowOpacity: 0.25,
    boxShadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.darkText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
