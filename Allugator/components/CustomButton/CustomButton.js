import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Styles from './Style';

/**
 * Componente de botão customizado e reutilizável.
 * Baseado no componente CustomButtom do capítulo 3 do PDF.
 * @param {object} props - Propriedades do componente.
 * @param {string} props.title - O texto a ser exibido no botão.
 * @param {function} props.onPress - A função a ser chamada quando o botão for pressionado.
 * @param {object} props.style - Estilos adicionais para o container do botão.
 * @param {object} props.textStyle - Estilos adicionais para o texto do botão.
 */
function CustomButton({ title, onPress, style, textStyle }) {
  return (
    // TouchableOpacity é a base para botões customizáveis, como visto no PDF.
    <TouchableOpacity onPress={onPress} style={[Styles.button, style]}>
      <Text style={[Styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

// Exporta o componente para que possa ser importado em outras partes do app.
export default CustomButton;
