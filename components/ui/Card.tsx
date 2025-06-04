import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView 
      style={[
        styles.card,
        { 
          backgroundColor: Colors[colorScheme].componentBase,
          shadowColor: Colors[colorScheme].text, // Or a fixed shadow color like '#000'
        },
        style
      ]} 
      {...rest}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    // Shadow properties for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
}); 