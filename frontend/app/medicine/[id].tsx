import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import Header from '@/components/common/Header';
import MedicineHeader from '@/components/medicine/MedicineHeader';
import SafetyAlert from '@/components/medicine/SafetyAlert';
import InfoSection from '@/components/medicine/InfoSection';
import TrackIntake from '@/components/medicine/TrackIntake';
import { medicines } from '@/data/medicines';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showUrdu, setShowUrdu] = useState(false);

  const medicine = medicines.find((m) => m.id === id) || medicines[0];

  const translateStyle = useAnimatedEntry(100, 'fadeSlideUp');

  const safetyWarning = `Warning: Consult your doctor before use if you have a history of liver issues or chronic alcohol consumption. Do not take with other products containing ${medicine.activeIngredient.toLowerCase()}.`;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header
        title="Medicine Details"
        rightIcon="share-social-outline"
        onRightPress={() => {}}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.translateRow, translateStyle]}>
          <TouchableOpacity
            style={styles.translateBtn}
            onPress={() => setShowUrdu(!showUrdu)}
            activeOpacity={0.7}
          >
            <Text style={styles.translateText}>
              {showUrdu ? 'Translate to English' : 'Translate to Urdu'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.content}>
          <MedicineHeader
            name={medicine.medicineName}
            manufacturer={medicine.manufacturer}
            activeIngredient={medicine.activeIngredient}
            strength={medicine.strength}
            isAuthentic={medicine.isAuthentic}
          />

          <SafetyAlert
            warnings={[safetyWarning]}
            onViewAll={() =>
              Alert.alert('Full Warnings', medicine.warnings.join('\n\n'))
            }
          />

          <InfoSection
            title="Uses"
            items={medicine.uses}
            icon="checkmark-circle"
            iconColor={Colors.primary}
            delay={500}
          />

          <InfoSection
            title="Side Effects"
            items={medicine.sideEffects}
            icon="alert-circle"
            iconColor={Colors.warning}
            delay={600}
          />

          <TrackIntake
            onAddToHistory={() =>
              Alert.alert('Added', `${medicine.medicineName} added to your history.`)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xxxl,
  },
  translateRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  translateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  translateText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
    fontWeight: Theme.fontWeight.medium,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
  },
});
