import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import OnboardingIllustration from './OnboardingIllustration';

type Props = {
  variant: 'scan' | 'know' | 'alerts';
  title: string;
  body: string;
};

export default function OnboardingSlide({ variant, title, body }: Props) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={{ width }}
      className="flex-1 items-center justify-center px-8"
    >
      <View className="items-center justify-center" style={{ marginBottom: 32 }}>
        <OnboardingIllustration variant={variant} />
      </View>
      <Text className="text-ink text-center text-2xl font-bold tracking-tight">
        {title}
      </Text>
      <Text className="text-ink-muted mt-3 text-center text-base leading-6">
        {body}
      </Text>
    </View>
  );
}
