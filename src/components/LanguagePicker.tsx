import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { useLanguage } from '../i18n/LanguageContext';
import type { AppLanguage } from '../i18n/types';

/** Compact 3-option language switcher for farmers. */
export default function LanguagePicker() {
  const { language, setLanguage, options, t } = useLanguage();

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      <Text style={styles.label}>{t.language}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = language === opt.code;
          return (
            <TouchableOpacity
              key={opt.code}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setLanguage(opt.code as AppLanguage)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={opt.nativeLabel}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.nativeLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginTop: 18, alignItems: 'center' },
  label: {
    fontSize: 12,
    color: COLORS.grey,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
});
