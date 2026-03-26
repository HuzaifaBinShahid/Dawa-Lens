import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import Header from '@/components/common/Header';
import CommonButton from '@/components/common/CommonButton';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type ProfileFieldProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  delay: number;
};

function ProfileField({ label, value, icon, delay }: ProfileFieldProps) {
  const style = useAnimatedEntry(delay, 'fadeSlideUp');

  return (
    <Animated.View style={[styles.field, style]}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const avatarStyle = useAnimatedEntry(100, 'scale');
  const nameStyle = useAnimatedEntry(200, 'fadeSlideUp');
  const statsStyle = useAnimatedEntry(300, 'fadeSlideUp');

  return (
    <View style={styles.container}>
      <Header title="Profile" showBack={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.avatarContainer, avatarStyle]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
        </Animated.View>

        <Animated.View style={nameStyle}>
          <Text style={styles.name}>User</Text>
          <Text style={styles.email}>user@dawalens.pk</Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, statsStyle]}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Searches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </Animated.View>

        <View style={styles.fieldsSection}>
          <ProfileField
            label="Full Name"
            value="User"
            icon="person-outline"
            delay={400}
          />
          <ProfileField
            label="Email"
            value="user@dawalens.pk"
            icon="mail-outline"
            delay={500}
          />
          <ProfileField
            label="Phone"
            value="+92 300 1234567"
            icon="call-outline"
            delay={600}
          />
          <ProfileField
            label="Location"
            value="Karachi, Pakistan"
            icon="location-outline"
            delay={700}
          />
        </View>

        <Animated.View style={useAnimatedEntry(800, 'fadeSlideUp')}>
          <CommonButton
            title="Edit Profile"
            onPress={() => {}}
            variant="outline"
            style={styles.editButton}
          />
        </Animated.View>
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
  avatarContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  name: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  email: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Theme.spacing.xxl,
    marginHorizontal: Theme.spacing.xxl,
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.grayBorder,
  },
  fieldsSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    gap: Theme.spacing.md,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: Theme.fontSize.lg,
    color: Colors.text,
    fontWeight: Theme.fontWeight.medium,
  },
  editButton: {
    marginHorizontal: Theme.spacing.lg,
  },
});
