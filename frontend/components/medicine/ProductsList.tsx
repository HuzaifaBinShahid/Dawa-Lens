import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAnimatedEntry } from '@/hooks/useAnimatedEntry';
import { Product } from '@/types';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type ProductsListProps = {
  products: Product[];
  delay?: number;
};

export default function ProductsList({ products, delay = 700 }: ProductsListProps) {
  const style = useAnimatedEntry(delay, 'fadeSlideUp');

  if (!products || products.length === 0) return null;

  return (
    <Animated.View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
        <Text style={styles.title}>Available Products</Text>
      </View>
      {products.map((product, idx) => (
        <ProductCard key={`${product.brand}-${idx}`} product={product} index={idx} />
      ))}
    </Animated.View>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const style = useAnimatedEntry(800 + index * 100, 'slideLeft');
  return (
    <Animated.View style={[styles.card, style]}>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.manufacturer}>by {product.manufacturer}</Text>
      {product.variants && product.variants.length > 0 && (
        <View style={styles.variantsBox}>
          <View style={styles.variantHeaderRow}>
            <Text style={[styles.variantHeader, styles.colForm]}>FORM</Text>
            <Text style={[styles.variantHeader, styles.colSize]}>SIZE</Text>
            <Text style={[styles.variantHeader, styles.colPrice]}>MRP</Text>
          </View>
          {product.variants.map((variant, vi) => (
            <View key={vi} style={styles.variantRow}>
              <Text style={[styles.variantCell, styles.colForm]} numberOfLines={1}>
                {variant.form || '—'}
              </Text>
              <Text style={[styles.variantCell, styles.colSize]} numberOfLines={1}>
                {variant.size || '—'}
              </Text>
              <Text style={[styles.variantCell, styles.colPrice]} numberOfLines={1}>
                {variant.mrp ? `Rs ${variant.mrp}` : '—'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  brand: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.text,
  },
  manufacturer: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  variantsBox: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
  },
  variantHeaderRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBorder,
  },
  variantRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  variantHeader: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  variantCell: {
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
  },
  colForm: { flex: 1.2 },
  colSize: { flex: 1.5 },
  colPrice: { flex: 1, textAlign: 'right' },
});
