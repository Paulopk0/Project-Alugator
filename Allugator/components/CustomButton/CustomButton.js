import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Styles from './Style';

/**
 * Componente de botão customizado e reutilizável.
 * Baseado no componente CustomButton do projeto.
 *
 * Bloco importante: este componente é usado em muitos formulários e ações-chave
 * (login, registro, formulários de item). Qualquer alteração na API (props)
 * deve ser refletida em todos os usos.
 *
 * Props:
 * - `title` (string): texto exibido
 * - `onPress` (function): callback ao pressionar
 * - `style` (object): estilos do container
 * - `textStyle` (object): estilos do texto
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
