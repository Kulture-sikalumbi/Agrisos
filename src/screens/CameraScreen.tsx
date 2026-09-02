import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, RADIUS } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { classifyImage } from '../services/classifier';
import { useLanguage } from '../i18n/LanguageContext';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
};

export default function CameraScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      setAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo) throw new Error('No photo taken');
      await runAnalysis(photo.uri);
    } catch {
      setAnalyzing(false);
      Alert.alert('Error', 'Could not take photo. Please try again.');
    }
  }

  async function handlePickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo gallery.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setAnalyzing(true);
      await runAnalysis(result.assets[0].uri);
    }
  }

  async function runAnalysis(uri: string) {
    try {
      const result = await classifyImage(uri);
      navigation.replace('Result', { imageUri: uri, classifierResult: result });
    } catch {
      Alert.alert('Analysis failed', 'Could not analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <TouchableOpacity
          style={styles.permissionBack}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Text style={styles.permissionBackText}>← {t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>{t.cameraNeededTitle}</Text>
        <Text style={styles.permissionSub}>{t.cameraNeededSub}</Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>{t.allowCamera}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.galleryFallbackBtn}
          onPress={handlePickFromGallery}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.galleryFallbackText}>🖼️  {t.permissionGallery}</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />

        <View style={styles.topOverlay} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={10}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backBtnText}>← {t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.cameraHint}>{t.cameraHint}</Text>
          <View style={{ width: 72 }} />
        </View>

        <View style={styles.frameWrapper} pointerEvents="none">
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.frameHint}>{t.frameHint}</Text>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={handlePickFromGallery}
            disabled={analyzing}
          >
            <Text style={styles.galleryIcon}>🖼️</Text>
            <Text style={styles.galleryText}>{t.gallery}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, analyzing && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={analyzing}
            activeOpacity={0.8}
          >
            {analyzing ? (
              <ActivityIndicator color={COLORS.white} size="large" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <View style={{ width: 64 }} />
        </View>
      </View>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color={COLORS.greenLight} />
          <Text style={styles.analyzingText}>{t.analyzing}</Text>
          <Text style={styles.analyzingSubText}>{t.analyzingSub}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const FRAME_SIZE = width * 0.72;
const CORNER = 28;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraContainer: { flex: 1 },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionBack: { position: 'absolute', top: 16, left: 16 },
  permissionBackText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  permissionEmoji: { fontSize: 64 },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  permissionSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10 },
  grantButton: {
    marginTop: 28,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  grantButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  galleryFallbackBtn: {
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
    minWidth: 220,
    alignItems: 'center',
  },
  galleryFallbackText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backBtn: {
    minWidth: 72,
    height: 40,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cameraHint: { color: COLORS.white, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  frameWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: COLORS.greenLight,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  frameHint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 36,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  galleryBtn: { alignItems: 'center', width: 64 },
  galleryIcon: { fontSize: 28 },
  galleryText: { color: COLORS.white, fontSize: 12, marginTop: 4 },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  captureBtnDisabled: { opacity: 0.5 },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
    elevation: 30,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  analyzingText: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  analyzingSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
});
