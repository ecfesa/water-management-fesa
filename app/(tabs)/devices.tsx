import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Category, Device } from '@/types';
import apiClient from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface CategoryDisplay extends Category {
    iconName?: keyof typeof Ionicons.glyphMap;
    totalUsage?: number;
    devices?: Partial<Device>[]; 
    description?: string;
    icon?: string;
}

interface DeviceItemProps {
    device: Partial<Device>;
    onEdit: (device: Partial<Device>) => void;
    onDelete: (deviceId: string) => void;
}

const DeviceItem = ({ device, onEdit, onDelete }: DeviceItemProps) => (
    <View style={styles.deviceItem}>
        <View style={styles.deviceInfo}>
            <Ionicons name="hardware-chip-outline" size={20} color={Colors.light.highlight} style={styles.deviceIcon} />
            <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
        </View>
        <View style={styles.deviceActions}>
            <TouchableOpacity onPress={() => onEdit(device)} style={styles.deviceActionIcon}>
                <Ionicons name="pencil-outline" size={20} color={Colors.light.detailsBase} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(device.id!)} style={styles.deviceActionIcon}>
                <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
            </TouchableOpacity>
        </View>
    </View>
);

export default function DevicesScreen() {
  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDisplay | null>(null);
  const [isDeviceModalVisible, setIsDeviceModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Partial<Device> | null>(null);
  const [parentCategoryForNewDevice, setParentCategoryForNewDevice] = useState<string | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('cube-outline');
  const [deviceName, setDeviceName] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');

  const fetchData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      // Example: Fetch categories. Devices and totalUsage might be fetched per category or in a more complex endpoint
      const response = await apiClient.get<CategoryDisplay[]>('/categories'); 
      // If devices/usage are not included, you might need further calls or a different backend structure
      // For now, assuming the API returns categories that can be mapped to CategoryDisplay
      setCategories(response.data.map(cat => ({ // Ensure mock data or API data matches this structure
        ...cat,
        iconName: cat.iconName || 'hardware-chip-outline', // Default icon
        totalUsage: cat.totalUsage || 0,
        devices: cat.devices || []
      })));

      console.log(categories);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch device categories.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      setCategories([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryIcon('cube-outline');
    setEditingCategory(null);
  };

  const resetDeviceForm = () => {
    setDeviceName('');
    setDeviceDescription('');
    setEditingDevice(null);
  };

  const handleAddCategory = () => {
    resetCategoryForm();
    setIsCategoryModalVisible(true);
  };

  const handleEditCategory = (category: CategoryDisplay) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setCategoryIcon(category.icon || 'cube-outline');
    setIsCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryName.trim()) {
        Alert.alert('Error', 'Category name is required');
        return;
      }

      const categoryData = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        icon: categoryIcon
      };

      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, categoryData);
      } else {
        await apiClient.post('/categories', categoryData);
      }

      setIsCategoryModalVisible(false);
      resetCategoryForm();
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this category and all its devices?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await apiClient.delete(`/categories/${categoryId}`);
          Alert.alert("Success", "Category deleted successfully");
          fetchData();
        } catch (error: any) {
          Alert.alert("Error", error.response?.data?.message || "Failed to delete category");
        }
      }}
    ]);
  };

  const handleAddDevice = (categoryId: string) => {
    setParentCategoryForNewDevice(categoryId);
    setDeviceName('');
    setDeviceDescription('');
    setEditingDevice(null);
    setIsDeviceModalVisible(true);
  };

  const handleEditDevice = (device: Partial<Device>) => {
    setEditingDevice(device);
    setDeviceName(device.name || '');
    setDeviceDescription(device.description || '');
    setParentCategoryForNewDevice(device.categoryId || null);
    setIsDeviceModalVisible(true);
  };

  const handleDeleteDevice = (deviceId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this device?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await apiClient.delete(`/devices/${deviceId}`);
          Alert.alert("Success", "Device deleted successfully");
          fetchData();
        } catch (error: any) {
          Alert.alert("Error", error.response?.data?.message || "Failed to delete device");
        }
      }}
    ]);
  };

  const handleSaveDevice = async () => {
    try {
      if (!deviceName.trim()) {
        Alert.alert('Error', 'Device name is required');
        return;
      }

      if (!parentCategoryForNewDevice) {
        Alert.alert('Error', 'Category is required');
        return;
      }

      const deviceData = {
        name: deviceName.trim(),
        description: deviceDescription.trim(),
        categoryId: parentCategoryForNewDevice
      };

      if (editingDevice) {
        await apiClient.put(`/devices/${editingDevice.id}`, deviceData);
      } else {
        await apiClient.post('/devices', deviceData);
      }

      setIsDeviceModalVisible(false);
      resetDeviceForm();
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save device');
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText>Loading devices...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error && categories.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.danger} />
        <ThemedText type="subtitle" style={{color: Colors.light.danger, marginTop:10}}>Error Loading Categories</ThemedText>
        <ThemedText style={{textAlign: 'center', marginHorizontal: 20}}>{error}</ThemedText>
         <View style={{marginTop: 20, borderRadius: 8, overflow: 'hidden'}}>
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
        <View style={styles.screenHeader}>
          <ThemedText type="title" style={styles.title}>Water Devices</ThemedText>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.light.highlight} />
            <ThemedText style={styles.addButtonText}>New Category</ThemedText>
          </TouchableOpacity>
        </View>

        {categories.length === 0 && !loading ? (
            <ThemedView key="empty-state" style={[styles.card, styles.centered, {minHeight: 150}]}>
                <Ionicons name="information-circle-outline" size={40} color={Colors.light.icon} />
                <ThemedText style={{marginTop:10}}>No categories found.</ThemedText>
                <ThemedText style={{textAlign: 'center'}}>Tap 'New Category' to add your first one.</ThemedText>
            </ThemedView>
        ) : categories.map((category) => (
          <ThemedView key={category.id || `category-${Math.random()}`} style={styles.card}>
            <View style={styles.categoryHeader}>
              <Ionicons name={category.iconName || 'cube-outline'} size={24} color={Colors.light.highlight} style={styles.icon} />
              <ThemedText type="subtitle" style={styles.categoryName}>{category.name}</ThemedText>
              <View style={styles.categoryHeaderActions}>
                <TouchableOpacity onPress={() => handleEditCategory(category)} style={styles.headerActionIcon}>
                    <Ionicons name="pencil-outline" size={22} color={Colors.light.detailsBase} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(category.id)} style={styles.headerActionIcon}>
                    <Ionicons name="trash-outline" size={22} color={Colors.light.danger} />
                </TouchableOpacity>
              </View>
            </View>
            <ThemedText style={styles.totalUsage}>Total Usage: {category.totalUsage?.toFixed(1) || 'N/A'} L</ThemedText>
            
            {category.devices && category.devices.length === 0 ? (
              <ThemedText style={styles.emptyMessage}>No devices in this category.</ThemedText>
            ) : category.totalUsage === 0 && category.devices && category.devices.length > 0 ? (
                <ThemedText style={styles.emptyMessage}>Devices exist, but no usage recorded yet.</ThemedText>
            ) : (
              <>
                <ThemedText style={styles.deviceCount}>{category.devices?.length || 0} device(s)</ThemedText>
                {category.devices?.map(device => (
                  <DeviceItem 
                    key={device.id} 
                    device={device} 
                    onEdit={handleEditDevice}
                    onDelete={handleDeleteDevice}
                  />
                ))}
              </>
            )}
            <TouchableOpacity style={styles.categoryActionButton} onPress={() => handleAddDevice(category.id)}>
                <Ionicons name="add-outline" size={20} color={Colors.light.tint} />
                <ThemedText style={styles.categoryActionButtonText}>Add Device</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={categoryName}
              onChangeText={setCategoryName}
              placeholderTextColor={Colors.light.text + '80'}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={categoryDescription}
              onChangeText={setCategoryDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.light.text + '80'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setIsCategoryModalVisible(false);
                  resetCategoryForm();
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveCategory}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Device Modal */}
      <Modal
        visible={isDeviceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDeviceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>
              {editingDevice ? 'Edit Device' : 'New Device'}
            </ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Device Name"
              value={deviceName}
              onChangeText={setDeviceName}
              placeholderTextColor={Colors.light.text + '80'}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={deviceDescription}
              onChangeText={setDeviceDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.light.text + '80'}
            />

            <View style={styles.categorySelector}>
              <ThemedText style={styles.categoryLabel}>Category:</ThemedText>
              <View style={styles.categoryDropdown}>
                <ThemedText style={styles.selectedCategory}>
                  {categories.find(cat => cat.id === parentCategoryForNewDevice)?.name || 'Select a category'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setIsDeviceModalVisible(false);
                  resetDeviceForm();
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveDevice}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
    flex:1, // Ensure it takes space if content is small
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    flex: 1, 
    color: Colors.light.text,
    fontSize: 24, // Adjusted for no header
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.componentBase,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.highlight,
  },
  addButtonText: {
    marginLeft: 5,
    color: Colors.light.highlight,
    fontSize: 14,
    fontWeight: '500'
  },
  card: {
    backgroundColor: Colors.light.componentBase,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryHeaderActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  headerActionIcon: {
    padding: 5, // make touch target larger
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  categoryName: {
    flex: 1, 
    color: Colors.light.highlight,
    fontSize: 18,
    fontWeight: '600',
  },
  totalUsage: {
    fontSize: 16,
    // fontWeight: 'bold', // Made it normal weight for less emphasis than name
    marginBottom: 8,
    color: Colors.light.text,
    opacity: 0.9,
  },
  deviceCount: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: 10,
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: Colors.light.text,
    opacity: 0.7,
    marginTop: 5,
    marginBottom: 10,
  },
  categoryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  categoryActionButtonText: {
    marginLeft: 8,
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '500'
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    marginRight: 10,
  },
  deviceName: {
    fontSize: 16,
    color: Colors.light.text,
  },
  deviceActions: {
    flexDirection: 'row',
  },
  deviceActionIcon: {
    padding: 5,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.light.componentBase,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  saveButton: {
    backgroundColor: Colors.light.highlight,
  },
  cancelButtonText: {
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButtonText: {
    color: Colors.light.background,
    textAlign: 'center',
    fontWeight: '500',
  },
  categorySelector: {
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.light.text,
  },
  categoryDropdown: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  selectedCategory: {
    color: Colors.light.text,
  },
}); 