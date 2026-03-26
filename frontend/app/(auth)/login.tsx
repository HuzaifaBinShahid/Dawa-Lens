import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import AuthHeader from '@/components/auth/AuthHeader';
import CommonInput from '@/components/common/CommonInput';
import PasswordInput from '@/components/common/PasswordInput';
import CommonButton from '@/components/common/CommonButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const formStyle = useAnimatedEntry(600, 'fadeSlideUp');
  const buttonStyle = useAnimatedEntry(800, 'fadeSlideUp');
  const footerStyle = useAnimatedEntry(1000, 'fadeIn');

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to continue to DawaLens"
        />

        <Animated.View style={[styles.form, formStyle]}>
          <CommonInput
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.inputSpacing}
          />
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonSection, buttonStyle]}>
          <CommonButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
          />
        </Animated.View>

        <Animated.View style={[styles.footer, footerStyle]}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  container: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.xxl,
    justifyContent: 'center',
  },
  form: {
    marginBottom: Theme.spacing.xxl,
  },
  inputSpacing: {
    marginTop: Theme.spacing.lg,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: Theme.spacing.md,
  },
  forgotText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.medium,
  },
  buttonSection: {
    marginBottom: Theme.spacing.xxl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: Theme.fontWeight.semibold,
  },
});
