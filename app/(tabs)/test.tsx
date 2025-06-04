import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import apiClient from '@/utils/apiClient';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, View } from 'react-native';

export default function TestScreen() {
  const [loadingSimulate, setLoadingSimulate] = useState(false);

  const handleSimulateMonth = async () => {
    setLoadingSimulate(true);
    try {
      const response = await apiClient.post('/test/simulate-month');
      Alert.alert(
        'Success', 
        `Month simulated successfully!\n\nCreated:\n- ${response.data.categoriesCreated} categories\n- ${response.data.devicesUsed} devices\n- ${response.data.usagesCreated} usage records`
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to simulate month.');
    }
    setLoadingSimulate(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Test & Simulation</ThemedText>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Simulate Usage</ThemedText>
        <ThemedText style={styles.description}>
          Press this button to add a predefined set of water usage data for one month.
          This will create categories, devices, and usage records for testing dashboards and metrics.
        </ThemedText>
        <View style={styles.buttonWrapper}>
          {loadingSimulate ? (
            <ActivityIndicator color={Colors.light.highlight} />
          ) : (
            <Button 
              title="Simulate One Month of Usage" 
              onPress={handleSimulateMonth}
              color={Colors.light.highlight}
            />
          )}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: Colors.light.componentBase,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.light.highlight,
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.light.text,
    opacity: 0.8,
  },
  buttonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
}); 