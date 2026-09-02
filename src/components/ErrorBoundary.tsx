import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{this.state.error.message}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: '#FFEBEE' },
  title: { fontSize: 20, fontWeight: '700', color: '#C62828', marginBottom: 12 },
  scroll: { flex: 1 },
  message: { fontSize: 14, color: '#333', lineHeight: 20 },
});
