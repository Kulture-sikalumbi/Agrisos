import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const ZARI_PHONE_NUMBERS = ['0211278130', '0211278390'];

export default function ExtensionContactCard() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  async function callNumber(number: string) {
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(t.contactCallUnavailable, number);
      return;
    }
    await Linking.openURL(url);
  }

  async function copyNumber(number: string) {
    await Clipboard.setStringAsync(number);
    Alert.alert(t.contactCopied, number);
  }

  return (
    <View style={[styles.card, SHADOW.small, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t.contactTitle}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.contactSubtitle}</Text>
      <Text style={[styles.organisation, { color: colors.grey }]}>ZARI — Zambia Agriculture Research Institute</Text>

      {ZARI_PHONE_NUMBERS.map((number) => (
        <View key={number} style={styles.numberRow}>
          <Text selectable style={[styles.number, { color: colors.text }]}>
            {number}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => callNumber(number)}
              accessibilityRole="button"
              accessibilityLabel={`${t.contactCall} ${number}`}
            >
              <Text style={styles.actionText}>☎ {t.contactCall}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton, { backgroundColor: colors.greenPale, borderColor: colors.border }]}
              onPress={() => copyNumber(number)}
              accessibilityRole="button"
              accessibilityLabel={`${t.contactCopy} ${number}`}
            >
              <Text style={[styles.actionText, styles.copyText, { color: colors.primary }]}>▣ {t.contactCopy}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text selectable style={[styles.email, { color: colors.primary }]}>
        {t.contactEmail}: info@zari.gov.zm
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginTop: 16,
  },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 19 },
  organisation: { fontSize: 12, color: COLORS.grey, marginTop: 8 },
  numberRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
  },
  number: { fontSize: 17, fontWeight: '700', color: COLORS.text, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  copyButton: { backgroundColor: COLORS.greenPale, borderWidth: 1, borderColor: COLORS.border },
  actionText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  copyText: { color: COLORS.primary },
  email: { fontSize: 13, color: COLORS.primary, marginTop: 12 },
});
