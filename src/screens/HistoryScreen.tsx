import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import {
  clearScanHistory,
  getScanHistory,
  type ScanHistoryItem,
} from '../services/scanHistory';
import { useLanguage } from '../i18n/LanguageContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function HistoryScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState<ScanHistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getScanHistory().then((list) => {
        if (active) setItems(list);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  function confirmClear() {
    Alert.alert(t.clearConfirmTitle, t.clearConfirmBody, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.clear,
        style: 'destructive',
        onPress: async () => {
          await clearScanHistory();
          setItems([]);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← {t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.historyTitle}</Text>
        <TouchableOpacity onPress={confirmClear} disabled={items.length === 0}>
          <Text style={[styles.clearText, items.length === 0 && styles.clearDisabled]}>
            {t.clear}
          </Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t.noScansYet}</Text>
          <Text style={styles.emptySub}>{t.noScansSub}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const info = t.diseases[item.disease];
            return (
              <TouchableOpacity
                style={[styles.row, SHADOW.small]}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('Result', {
                    imageUri: item.imageUri,
                    classifierResult: {
                      disease: item.disease,
                      confidence: item.confidence,
                      isConfident: item.confidence >= 0.75,
                      needsCloudAdvice: false,
                    },
                    fromHistory: true,
                  })
                }
              >
                <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                <View style={styles.meta}>
                  <Text style={styles.disease}>{info.shortLabel}</Text>
                  <Text style={styles.when}>{formatWhen(item.createdAt)}</Text>
                  <Text style={styles.conf}>
                    {Math.round(item.confidence * 100)}% {t.confidence.toLowerCase()}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600', width: 70 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  clearText: { fontSize: 14, color: COLORS.red, fontWeight: '600', width: 70, textAlign: 'right' },
  clearDisabled: { opacity: 0.35 },
  list: { padding: 16, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: RADIUS.sm, backgroundColor: COLORS.greyLight },
  meta: { flex: 1 },
  disease: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  when: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
  conf: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  chevron: { fontSize: 22, color: COLORS.grey },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
