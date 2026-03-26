import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type PasswordInputProps = TextInputProps & {
  containerStyle?: object;
};

export default function PasswordInput({
  containerStyle,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons
        name="lock-closed-outline"
        size={20}
        color={Colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={!visible}
        {...props}
      />
      <TouchableOpacity onPress={() => setVisible(!visible)}>
        <Ionicons
          name={visible ? 'eye-outline' : 'eye-off-outline'}
          size={20}
          color={Colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Theme.spacing.lg,
    height: 50,
  },
  icon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    height: '100%',
  },
});
