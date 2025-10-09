import { StyleSheet } from 'react-native';

const COLORS = {
  darkText: '#555555',
  lightGray: '#ccc',
  white: '#FFFFFF',
};

/**
 * Folha de estilos para o componente CustomTextInput.
 */
export default StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 10,
  },
  label: {
    color: COLORS.darkText,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 20,
    color: COLORS.darkText,
  },
  icon: {
    padding: 10,
    marginRight: 5,
  },
  iconText: {
    fontSize: 20,
  }
});

