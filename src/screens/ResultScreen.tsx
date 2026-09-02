import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { DISEASE_CHROME } from '../constants/diseaseChrome';
import type { RootStackParamList } from '../navigation/types';
import { getSecondOpinion, type GeminiAdvice } from '../services/gemini';
import { saveScanToHistory } from '../services/scanHistory';
import { useLanguage } from '../i18n/LanguageContext';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const COLOR_MAP = {
  red: {
    bg: COLORS.redPale,
    accent: COLORS.redLight,
    dark: COLORS.red,
    emoji: '🔴',
  },
  yellow: {
    bg: COLORS.yellowPale,
    accent: COLORS.yellowLight,
    dark: COLORS.yellow,
    emoji: '🟡',
  },
  green: {
    bg: COLORS.greenPale,
    accent: COLORS.greenLight,
    dark: COLORS.green,
    emoji: '🟢',
  },
};

export default function ResultScreen({ navigation, route }: Props) {
  const { t } = useLanguage();
  const { imageUri, classifierResult, fromHistory } = route.params;
  const rejected = Boolean(classifierResult.rejected);
  const info = t.diseases[classifierResult.disease];
  const chrome = DISEASE_CHROME[classifierResult.disease];
  const palette = COLOR_MAP[chrome.color];
  const [aiOpinion, setAiOpinion] = useState<GeminiAdvice | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!fromHistory && !rejected) {
      saveScanToHistory({
        imageUri,
        disease: classifierResult.disease,
        confidence: classifierResult.confidence,
        rejected: false,
      }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (rejected || fromHistory) return;
    // Prefetch AI only when the offline result is uncertain / disease-risk
    if (classifierResult.needsCloudAdvice) {
      fetchAIOpinion();
    }
  }, []);

  async function fetchAIOpinion() {
    if (rejected) return;
    setLoadingAI(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const opinion = await getSecondOpinion(
        base64,
        info.label,
        classifierResult.confidence,
        {
          topTwoDelta: classifierResult.topTwoDelta,
          needsCloudAdvice: classifierResult.needsCloudAdvice,
        }
      );
      setAiOpinion(opinion);
    } catch {
      setAiOpinion(null);
    } finally {
      setLoadingAI(false);
    }
  }

  if (rejected) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.yellowPale }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.yellowPale} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backText}>← {t.backHome}</Text>
          </TouchableOpacity>

          <Image source={{ uri: imageUri }} style={styles.leafImage} resizeMode="cover" />

          <View style={[styles.resultCard, SHADOW.medium]}>
            <Text style={styles.trafficEmoji}>🟡</Text>
            <Text style={[styles.diseaseName, { color: COLORS.yellow }]}>{t.photoNotUsable}</Text>
            <Text style={styles.actionText}>
              {classifierResult.rejectCode === 'too_small'
                ? t.rejectTooSmall
                : classifierResult.rejectCode === 'too_dark'
                  ? t.rejectTooDark
                  : classifierResult.rejectCode === 'too_bright'
                    ? t.rejectTooBright
                    : classifierResult.rejectCode === 'too_flat'
                      ? t.rejectTooFlat
                      : classifierResult.rejectCode === 'decode_failed'
                        ? t.rejectDecode
                        : classifierResult.rejectReason ?? t.rejectDecode}
            </Text>
          </View>

          <View style={[styles.adviceCard, SHADOW.small]}>
            <Text style={styles.adviceTitle}>{t.goodPhotoTitle}</Text>
            <Text style={styles.adviceText}>{t.goodPhotoSteps}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.actionBtnText}>📷  {t.retakePhoto}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={[styles.chatBtnText, { color: COLORS.primary }]}>← {t.backHome}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.bg} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backText}>← {t.backHome}</Text>
        </TouchableOpacity>

        <Image source={{ uri: imageUri }} style={styles.leafImage} resizeMode="cover" />

        <View style={[styles.resultCard, SHADOW.medium]}>
          <Text style={styles.trafficEmoji}>{palette.emoji}</Text>
          <Text style={[styles.diseaseName, { color: palette.dark }]}>{info.label}</Text>
          <Text style={styles.actionText}>{info.action}</Text>

          <View style={styles.confidenceWrapper}>
            <Text style={styles.confidenceLabel}>
              {t.confidence}: {Math.round(classifierResult.confidence * 100)}%
            </Text>
            <View style={styles.confidenceBarBg}>
              <View
                style={[
                  styles.confidenceBarFill,
                  {
                    width: `${Math.round(classifierResult.confidence * 100)}%`,
                    backgroundColor: palette.accent,
                  },
                ]}
              />
            </View>
          </View>

          {!classifierResult.isConfident && (
            <Text style={styles.lowConfidenceNote}>{t.lowConfidence}</Text>
          )}
        </View>

        <View style={[styles.adviceCard, SHADOW.small]}>
          <Text style={styles.adviceTitle}>{t.whatToDoNow}</Text>
          <Text style={styles.adviceText}>{info.advice}</Text>
        </View>

        <View style={[styles.adviceCard, SHADOW.small]}>
          <Text style={styles.adviceTitle}>{t.prevention}</Text>
          <Text style={styles.adviceText}>{info.prevention}</Text>
        </View>

        <TouchableOpacity
          style={[styles.moreToggle, SHADOW.small]}
          onPress={() => setShowMore((v) => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.moreToggleText}>{showMore ? t.hideTips : t.moreTips}</Text>
          <Text style={styles.moreChevron}>{showMore ? '▴' : '▾'}</Text>
        </TouchableOpacity>

        {showMore && (
          <>
            <View style={[styles.adviceCard, SHADOW.small]}>
              <Text style={styles.adviceTitle}>{t.treatmentNote}</Text>
              <Text style={styles.adviceText}>{info.treatment}</Text>
            </View>

            <View style={[styles.aiCard, SHADOW.small]}>
              <Text style={styles.aiTitle}>{t.aiAdvice}</Text>
              {loadingAI ? (
                <View style={styles.aiLoading}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.aiLoadingText}>{t.gettingAdvice}</Text>
                </View>
              ) : aiOpinion ? (
                <View>
                  <Text style={styles.aiMeta}>
                    {aiOpinion.primary_diagnosis.replaceAll('_', ' ')} · severity{' '}
                    {aiOpinion.severity_score}/5
                  </Text>
                  <Text style={styles.aiText}>{aiOpinion.displayText}</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.aiOfflineText}>{t.aiNeedsInternet}</Text>
                  <TouchableOpacity onPress={fetchAIOpinion} style={styles.retryAi}>
                    <Text style={styles.retryAiText}>{t.tryAi}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: palette.dark }]}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.actionBtnText}>📷  {t.scanAnother}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() =>
              navigation.navigate('Chatbot', {
                contextMessage:
                  `My Agrisos scan result is "${info.label}" ` +
                  `(${Math.round(classifierResult.confidence * 100)}% confidence). ` +
                  `Explain simply what to do now, how to prevent spread, and whether any spray/chemical is useful. ` +
                  `Do not invent brand names; tell me to ask an extension officer for approved products.`,
              })
            }
          >
            <Text style={[styles.chatBtnText, { color: palette.dark }]}>💬  {t.askMoreHelp}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16, color: COLORS.grey, fontWeight: '600' },
  leafImage: {
    width: '100%',
    height: width * 0.55,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  trafficEmoji: { fontSize: 56, marginBottom: 8 },
  diseaseName: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  actionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  confidenceWrapper: { width: '100%', marginTop: 16 },
  confidenceLabel: { fontSize: 13, color: COLORS.grey, marginBottom: 6 },
  confidenceBarBg: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.greyLight,
    overflow: 'hidden',
  },
  confidenceBarFill: { height: 10, borderRadius: 5 },
  lowConfidenceNote: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.yellow,
    textAlign: 'center',
    fontWeight: '500',
  },
  adviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },
  adviceTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  adviceText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  moreToggle: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moreToggleText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  moreChevron: { fontSize: 14, color: COLORS.primary },
  aiCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  aiTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  aiMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  aiLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiLoadingText: { color: COLORS.grey, fontSize: 14 },
  aiText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  aiOfflineText: { fontSize: 14, color: COLORS.grey, lineHeight: 21 },
  retryAi: { marginTop: 10 },
  retryAiText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  actions: { gap: 10, marginTop: 4 },
  actionBtn: {
    borderRadius: RADIUS.full,
    paddingVertical: 15,
    alignItems: 'center',
    ...SHADOW.small,
  },
  actionBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  chatBtn: {
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.greyLight,
  },
  chatBtnText: { fontSize: 16, fontWeight: '600' },
});
