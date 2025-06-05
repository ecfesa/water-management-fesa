import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { Device, Usage } from '@/types';
import { devicesAPI, usageAPI } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface UsageWithDevice extends Usage {
  Device: {
    name: string;
  };
}

interface HomeData {
  totalWaterUsed: number;
  mostUsedSource: { name: string; usage: number; alert: boolean };
  last10Usages: UsageWithDevice[];
}

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      // Clear any existing data before fetching new data
      setData(null);

      // Fetch all usages and devices
      const [usagesResponse, devicesResponse] = await Promise.all([
        usageAPI.getAll(),
        devicesAPI.getAll()
      ]);

      const usages = usagesResponse.data;
      const devices = devicesResponse.data;

      // Calculate total water used
      const totalWaterUsed = usages.reduce((sum: number, usage: Usage) => sum + usage.value, 0);

      // Calculate most used source
      const deviceUsage = new Map<string, number>();
      usages.forEach((usage: Usage) => {
        const current = deviceUsage.get(usage.deviceId) || 0;
        deviceUsage.set(usage.deviceId, current + usage.value);
      });

      let mostUsedDevice: Device | undefined = undefined;
      let maxUsage = 0;
      deviceUsage.forEach((usage, deviceId) => {
        if (usage > maxUsage) {
          maxUsage = usage;
          const foundDevice = devices.find((d: Device) => d.id === deviceId);
          if (foundDevice) {
            mostUsedDevice = foundDevice;
          }
        }
      });

      // Sort usages by timestamp and get last 10
      const sortedUsages = [...usages]
        .sort((a: Usage, b: Usage) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10)
        .map(usage => {
          const device = devices.find((d: Device) => d.id === usage.deviceId);
          return {
            ...usage,
            Device: {
              name: device?.name || 'Unknown Device'
            }
          } as UsageWithDevice;
        });

      // Set alert if usage is above threshold (e.g., 1000L)
      const alertThreshold = 1000;

      const mostUsedSource = {
        name: mostUsedDevice?.name || 'No data',
        usage: maxUsage,
        alert: maxUsage > alertThreshold
      };

      setData({
        totalWaterUsed,
        mostUsedSource,
        last10Usages: sortedUsages
      });
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      setData(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, [refreshing]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      // Clear data before logging out
      setData(null);
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText>Loading dashboard...</ThemedText>
      </ThemedView>
    );
  }

  if (error && !data) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.danger} />
        <ThemedText type="subtitle" style={{color: Colors.light.danger, marginTop:10}}>Error Loading Data</ThemedText>
        <ThemedText style={{textAlign: 'center', marginHorizontal: 20}}>{error}</ThemedText>
        <View style={{marginTop: 20, borderRadius: 8, overflow: 'hidden'}}>
          <Button title="Try Again" onPress={fetchData} color={Colors.light.tint} />
        </View>
      </ThemedView>
    );
  }

  const noData = !data || (data.totalWaterUsed === 0 && data.last10Usages.length === 0);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.tint]} />}
    >
      <ThemedView style={styles.contentContainer}>
        <View style={styles.header}>
          <ThemedText type="title">Water Usage Dashboard</ThemedText>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={Colors.light.danger} />
          </TouchableOpacity>
        </View>

        {noData ? (
          <ThemedView style={[styles.card, styles.centered, {minHeight: 200}]}>
            <Ionicons name="information-circle-outline" size={48} color={Colors.light.icon} />
            <ThemedText type="subtitle" style={{marginTop:10}}>No Water Usage Data</ThemedText>
            <ThemedText style={{textAlign: 'center'}}>Start adding devices and recording usage to see your dashboard.</ThemedText>
          </ThemedView>
        ) : data ? (
          <>
            <ThemedView style={[styles.card, styles.totalUsageCard]}>
              <View style={styles.totalUsageHeader}>
                <Ionicons name="water-outline" size={28} color={Colors.light.highlight} style={styles.headerIcon} />
                <ThemedText type="subtitle">Total Water Used</ThemedText>
              </View>
              <ThemedText style={styles.bigNumber}>{data.totalWaterUsed.toFixed(2)} L</ThemedText>
            </ThemedView>

            {data.mostUsedSource && (
              <ThemedView style={[styles.card, data.mostUsedSource.alert ? styles.alertCard : styles.infoCard]}>
                <ThemedText type="subtitle">Most Used Water Source</ThemedText>
                <ThemedText style={styles.sourceName}>{data.mostUsedSource.name}</ThemedText>
                <ThemedText>Usage: {data.mostUsedSource.usage.toFixed(2)} L</ThemedText>
                {data.mostUsedSource.alert && (
                  <ThemedText style={styles.alertText}>Warning: Intensive Use!</ThemedText>
                )}
              </ThemedView>
            )}

            <ThemedView style={styles.card}>
              <ThemedText type="subtitle">Last 10 Water Usages</ThemedText>
              {data.last10Usages.length > 0 ? (
                data.last10Usages.map((usage, index) => (
                  <ThemedView key={usage.id || index.toString()} style={styles.usageItem}>
                    <ThemedText style={styles.usageDevice}>{usage.Device?.name || 'N/A'}</ThemedText>
                    <ThemedText style={styles.usageValue}>{usage.value.toFixed(1)} L</ThemedText>
                  </ThemedView>
                ))
              ) : (
                <ThemedText>No recent usages recorded.</ThemedText>
              )}
            </ThemedView>
          </>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 15,
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: Colors.light.componentBase,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalUsageCard: {
    alignItems: 'center',
  },
  totalUsageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 10,
  },
  bigNumber: {
    fontSize: 40,
    padding: 20,
    fontWeight: 'bold',
    color: Colors.light.highlight,
    marginVertical: 10,
  },
  infoCard: {
    // Standard info card styling
  },
  alertCard: {
    borderColor: Colors.light.danger,
    borderWidth: 1,
    backgroundColor: '#fff3e0',
  },
  sourceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  alertText: {
    color: Colors.light.danger,
    fontWeight: 'bold',
    marginTop: 5,
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.detailsBase,
  },
  usageDevice: {
    fontSize: 16,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.highlight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 