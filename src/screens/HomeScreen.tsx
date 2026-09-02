import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { classifyImage } from '../services/classifier';
import { useLanguage } from '../i18n/LanguageContext';
import LanguagePicker from '../components/LanguagePicker';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo gallery to pick a leaf image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    setAnalyzing(true);
    try {
      const classifierResult = await classifyImage(result.assets[0].uri);
      navigation.navigate('Result', {
        imageUri: result.assets[0].uri,
        classifierResult,
      });
    } catch {
      Alert.alert('Analysis failed', 'Could not analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>🌿 {t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        <LanguagePicker />

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🍃</Text>
          <Text style={styles.heroTitle}>{t.heroTitle}</Text>
          <Text style={styles.heroSub}>{t.heroSub}</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.greenLight }]} />
            <Text style={styles.legendText}>{t.legendHealthy}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.yellowLight }]} />
            <Text style={styles.legendText}>{t.legendUnclear}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.redLight }]} />
            <Text style={styles.legendText}>{t.legendDisease}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Camera')}
          disabled={analyzing}
        >
          <Text style={styles.scanIcon}>📷</Text>
          <Text style={styles.scanButtonText}>{t.scanCamera}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          activeOpacity={0.85}
          onPress={pickFromGallery}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <Text style={styles.galleryIcon}>🖼️</Text>
              <Text style={styles.galleryButtonText}>{t.pickGallery}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Chatbot', {})}
          disabled={analyzing}
        >
          <Text style={styles.chatButtonText}>💬  {t.askAssistant}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyLink}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('History')}
          disabled={analyzing}
        >
          <Text style={styles.historyLinkText}>{t.recentScans} ›</Text>
        </TouchableOpacity>

        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>📵  {t.worksOffline}</Text>
        </View>
      </ScrollView>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color={COLORS.greenLight} />
          <Text style={styles.analyzingText}>{t.analyzing}</Text>
          <Text style={styles.analyzingSub}>{t.analyzingSub}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  header: { marginTop: 20, alignItems: 'center' },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.grey,
    marginTop: 4,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  heroCard: {
    marginTop: 20,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    ...SHADOW.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroEmoji: { fontSize: 56, marginBottom: 10 },
  heroTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  legendRow: { flexDirection: 'row', marginTop: 22, gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  legendText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  scanButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    paddingHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...SHADOW.medium,
    width: '100%',
    justifyContent: 'center',
  },
  scanIcon: { fontSize: 20 },
  scanButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  galleryButton: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
  },
  galleryIcon: { fontSize: 18 },
  galleryButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  chatButton: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    alignItems: 'center',
  },
  chatButtonText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  historyLink: { marginTop: 14, paddingVertical: 6 },
  historyLinkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  offlineBadge: {
    marginTop: 18,
    backgroundColor: COLORS.greyLight,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: { fontSize: 12, color: COLORS.grey, textAlign: 'center' },
  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  analyzingText: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  analyzingSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
});
