import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Category as CategoryType } from '@/types';
import apiClient from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ChartDataPoint {
  date: string;
  total: number;
  [categoryKey: string]: number | string;
}

interface MetricsData {
  chartData: ChartDataPoint[];
  availableCategories: CategoryType[];
}

export default function MetricsScreen() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const params: { days?: number; categories?: string } = { days: 10 };
      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }
      const response = await apiClient.get<MetricsData>('/metrics/daily-usage', { params });
      setMetricsData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch metrics data.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      setMetricsData(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, [refreshing, selectedCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
        prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const renderChart = () => {
    if (!metricsData || metricsData.chartData.length === 0) return null;

    const categories = selectedCategories.length > 0 
      ? metricsData.availableCategories.filter(cat => selectedCategories.includes(cat.id))
      : metricsData.availableCategories;

    const chartData = {
      labels: metricsData.chartData.map(point => 
        new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: categories.map((category, index) => ({
        data: metricsData.chartData.map(point => 
          Number(point[`category_${category.id}`]) || 0
        ),
        color: (opacity = 1) => Colors.light.chartColors[index % Colors.light.chartColors.length],
        strokeWidth: 2
      }))
    };

    const chartConfig = {
      backgroundGradientFrom: Colors.light.background,
      backgroundGradientTo: Colors.light.background,
      decimalPlaces: 0,
      color: (opacity = 1) => Colors.light.text,
      labelColor: (opacity = 1) => Colors.light.text,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: Colors.light.highlight
      }
    };

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 60}
          height={300}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix="L"
          yAxisInterval={1}
        />
        <View style={styles.legendContainer}>
          {categories.map((category, index) => (
            <View key={category.id} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: Colors.light.chartColors[index % Colors.light.chartColors.length] }
                ]} 
              />
              <ThemedText style={styles.legendText}>{category.name}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText>Loading metrics...</ThemedText>
      </ThemedView>
    );
  }

  if (error && !metricsData) {
     return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.danger} />
        <ThemedText type="subtitle" style={{color: Colors.light.danger, marginTop:10}}>Error Loading Metrics</ThemedText>
        <ThemedText style={{textAlign: 'center', marginHorizontal: 20}}>{error}</ThemedText>
        <View style={styles.buttonWrapperRetry}>
          <Button title="Try Again" onPress={fetchData} color={Colors.light.tint} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.tint]} />}
    >
      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>Water Usage Metrics</ThemedText>
        <ThemedText style={styles.subtitle}>(Last 10 Days)</ThemedText>

        {metricsData?.availableCategories && metricsData.availableCategories.length > 0 && (
            <View style={styles.filterContainer}>
                <ThemedText type="defaultSemiBold">Filter by Category:</ThemedText>
                {metricsData.availableCategories.map(cat => (
                    <View key={cat.id} style={styles.checkboxContainer}>
                        <View style={styles.buttonWrapper}>
                            <Button 
                                title={`${cat.name} ${selectedCategories.includes(cat.id) ? '✔' : ''}`}
                                onPress={() => toggleCategory(cat.id)} 
                                color={selectedCategories.includes(cat.id) ? Colors.light.highlight : Colors.light.detailsBase}
                            />
                        </View>
                    </View>
                ))}
            </View>
        )}

        {!metricsData || metricsData.chartData.length === 0 ? (
          <ThemedView style={[styles.card, styles.centered, {minHeight: 200}]}>
            <Ionicons name="stats-chart-outline" size={48} color={Colors.light.icon} />
            <ThemedText type="subtitle" style={{marginTop:10}}>No Usage Data</ThemedText>
            <ThemedText style={{textAlign: 'center'}}>No data available for the selected period or filters.</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={{textAlign: 'center', marginBottom: 15}}>Daily Water Usage Breakdown</ThemedText>
            {renderChart()}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 15,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: Colors.light.componentBase,
    borderRadius: 8,
  },
  checkboxContainer: {
    marginVertical: 5,
  },
  buttonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonWrapperRetry: {
    marginTop: 20, 
    borderRadius: 8, 
    overflow: 'hidden'
  },
  card: {
    backgroundColor: Colors.light.componentBase,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    minHeight: 200, 
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  }
}); 