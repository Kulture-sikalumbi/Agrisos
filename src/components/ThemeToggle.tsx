import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      accessibilityRole="switch"
      accessibilityState={{ checked: theme === 'dark' }}
      accessibilityLabel="Toggle dark mode"
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: theme === 'dark' ? '#344337' : '#FFFFFF',
        borderWidth: 1,
        borderColor: theme === 'dark' ? '#38543D' : '#C8E6C9',
      }}
    >
      <Text style={{ color: theme === 'dark' ? '#F1F8F2' : '#2E7D32', fontWeight: '700' }}>
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </Text>
    </TouchableOpacity>
  );
}
