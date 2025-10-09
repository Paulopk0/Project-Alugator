import React from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import Style from "./Style";

/**
 * Componente de caixa de texto customizado com rótulo e ícone opcional.
 */
function CustomTextInput({ label, icon, onIconPress, ...props }) {
  return (
    <View style={Style.container}>
      {label && <Text style={Style.label}>{label}</Text>}
      <View style={Style.inputContainer}>
        <TextInput
          style={Style.input}
          placeholderTextColor="#A9A9A9"
          {...props}
        />
        {icon && (
          <TouchableOpacity onPress={onIconPress} style={Style.icon}>
            <Text style={Style.iconText}>{icon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default CustomTextInput;

