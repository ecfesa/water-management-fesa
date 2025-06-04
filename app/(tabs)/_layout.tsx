import { TabBarIcon } from '@/components/navigation/TabBarIcon'; // We'll create this component
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false, // Remove headers from tab screens
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].componentBase,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].componentBase,
        },
        headerTintColor: Colors[colorScheme].text,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Water Devices',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'hardware-chip' : 'hardware-chip-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Bills',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'document-text' : 'document-text-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Test',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bug' : 'bug-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 