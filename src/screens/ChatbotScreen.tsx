import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { sendChatMessage, ChatMessage } from '../services/gemini';
import type { RootStackParamList } from '../navigation/types';
import { useLanguage } from '../i18n/LanguageContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chatbot'>;
  route: RouteProp<RootStackParamList, 'Chatbot'>;
};

interface DisplayMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const QUICK_QUESTIONS = [
  'What should I do if I find CMD?',
  'What should I do if I find CBSD?',
  'How do I get clean planting stems?',
  'How do I stop whiteflies spreading disease?',
  'When should I call an extension officer?',
  'How do I keep a healthy field?',
];

export default function ChatbotScreen({ navigation, route }: Props) {
  const { t, language } = useLanguage();
  const contextMessage = route.params?.contextMessage;
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const sentContext = useRef(false);

  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'model',
        text: t.chatWelcome,
      },
    ]);
    sentContext.current = false;
  }, [language, t.chatWelcome]);

  useEffect(() => {
    if (contextMessage && !sentContext.current && messages.length > 0) {
      sentContext.current = true;
      setTimeout(() => handleSend(contextMessage), 600);
    }
  }, [messages.length, contextMessage]);

  async function handleSend(text?: string) {
    const messageText = (text ?? input).trim();
    if (!messageText) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    Keyboard.dismiss();
    setLoading(true);

    try {
      const history: ChatMessage[] = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, text: m.text }));

      // Gemini always replies in simple English (UI may still be Bemba).
      const reply = await sendChatMessage(
        history,
        messageText + ' Please reply in simple English, short sentences.'
      );

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: t.chatOffline,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function renderMessage({ item }: { item: DisplayMessage }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && <Text style={styles.avatarEmoji}>🌿</Text>}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleBot,
          ]}
        >
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🌿 {t.chatTitle}</Text>
          <Text style={styles.headerSub}>{t.chatSub}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.avatarEmoji}>🌿</Text>
                <View style={styles.bubbleBot}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick questions */}
        <View style={styles.quickRow}>
          {QUICK_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.quickChip}
              onPress={() => handleSend(q)}
              disabled={loading}
            >
              <Text style={styles.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t.chatPlaceholder}
            placeholderTextColor={COLORS.grey}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...SHADOW.small,
  },
  backBtn: { color: COLORS.white, fontSize: 22, fontWeight: '700', width: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  messageRowUser: { justifyContent: 'flex-end' },
  avatarEmoji: { fontSize: 22, marginBottom: 4 },
  bubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleBot: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4,
    ...SHADOW.small,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  bubbleTextUser: { color: COLORS.white },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  quickChip: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.greyLight },
  sendIcon: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
});
