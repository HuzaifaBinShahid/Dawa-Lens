import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type CommonInputProps = TextInputProps & {
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: object;
};

export default function CommonInput({
  icon,
  containerStyle,
  ...props
}: CommonInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={Colors.textMuted}
          style={styles.icon}
        />
      )}
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textMuted}
        {...props}
      />
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
