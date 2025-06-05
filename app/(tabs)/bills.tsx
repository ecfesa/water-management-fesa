import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Bill } from '@/types';
import apiClient from '@/utils/apiClient';
import { BASE_URL } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

interface NewBillData {
    amount: string;
    waterUsed: string;
    dueDate: Date;
    billPeriodStart: Date | null;
    billPeriodEnd: Date | null;
    photo: ImagePicker.ImagePickerAsset | null;
}

const initialNewBillState: NewBillData = {
    amount: '',
    waterUsed: '',
    dueDate: new Date(),
    billPeriodStart: null,
    billPeriodEnd: null,
    photo: null,
};

export default function BillsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPhotoVisible, setPhotoModalVisible] = useState(false);
  const [newBill, setNewBill] = useState<NewBillData>(initialNewBillState);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComparisonGraph, setShowComparisonGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'dueDate' | 'startDate' | 'endDate' | null>(null);

  const fetchBills = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ bills: Bill[] }>('/bills?limit=12&sort=dueDate:desc');
      setBills(response.data.bills || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch bills.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      setBills([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [refreshing]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const openAddBillModal = () => {
    setEditingBill(null);
    setNewBill(initialNewBillState);
    setModalVisible(true);
  };

  const openEditBillModal = (bill: Bill) => {
    setEditingBill(bill);
    setNewBill({
        amount: bill.amount.toString(),
        waterUsed: bill.waterUsed.toString(),
        dueDate: new Date(bill.dueDate),
        billPeriodStart: bill.billPeriodStart ? new Date(bill.billPeriodStart) : null,
        billPeriodEnd: bill.billPeriodEnd ? new Date(bill.billPeriodEnd) : null,
        photo: null,
        
    });
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setNewBill(prev => ({
        ...prev,
        [showDatePicker === 'dueDate' ? 'dueDate' : 
         showDatePicker === 'startDate' ? 'billPeriodStart' : 'billPeriodEnd']: selectedDate
      }));
    }
  };

  const handleSaveBill = async () => {
    if (!newBill.amount || !newBill.waterUsed || !newBill.dueDate) {
      Alert.alert('Error', 'Please fill in all required fields (Amount, Water Used, and Due Date).');
      return;
    }

    // Validate numeric fields
    const amount = parseFloat(newBill.amount);
    const waterUsed = parseFloat(newBill.waterUsed);

    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    if (isNaN(waterUsed) || waterUsed < 0) {
      Alert.alert('Error', 'Please enter a valid water usage amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add basic fields
      formData.append('amount', amount.toString());
      formData.append('waterUsed', waterUsed.toString());
      formData.append('dueDate', newBill.dueDate.toISOString());
      
      if (newBill.billPeriodStart) {
        formData.append('billPeriodStart', newBill.billPeriodStart.toISOString());
      }
      if (newBill.billPeriodEnd) {
        formData.append('billPeriodEnd', newBill.billPeriodEnd.toISOString());
      }

      // Add photo if exists
      if (newBill.photo) {
        const uriParts = newBill.photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('billImage', {
          uri: Platform.OS === 'ios' ? newBill.photo.uri.replace('file://', '') : newBill.photo.uri,
          name: `bill_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const endpoint = editingBill ? `/bills/${editingBill.id}` : '/bills';
      const method = editingBill ? 'put' : 'post';
      
      console.log(`Making ${method.toUpperCase()} request to ${endpoint}`);
      console.log('FormData contents:', {
        amount: formData.get('amount'),
        waterUsed: formData.get('waterUsed'),
        dueDate: formData.get('dueDate'),
        billPeriodStart: formData.get('billPeriodStart'),
        billPeriodEnd: formData.get('billPeriodEnd'),
        hasImage: !!formData.get('billImage')
      });
      
      // Send the request with FormData
      const response = await fetch(`${apiClient.defaults.baseURL}${endpoint}`, {
        method: method.toUpperCase(),
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      // Handle the response
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw {
          response: {
            data: data,
            status: response.status
          }
        };
      }

      console.log('API Response:', data);

      Alert.alert('Success', `Bill ${editingBill ? 'updated' : 'added'} successfully!`);
      
      setModalVisible(false);
      setNewBill(initialNewBillState);
      setEditingBill(null);
      fetchBills();
    } catch (err: any) {
      console.error('Error saving bill:', err);
      
      // Log the full error details
      console.error('Full error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        errors: err.response?.data?.errors
      });

      // Format validation errors if they exist
      let errorMessage = err.response?.data?.message || err.message || 'Failed to save bill.';
      let errorDetails = '';

      if (err.response?.data?.errors) {
        errorDetails = err.response.data.errors
          .map((error: any) => `${error.path}: ${error.msg}`)
          .join('\n');
      } else if (err.response?.data?.details) {
        errorDetails = err.response.data.details;
      }

      const fullErrorMessage = errorMessage + (errorDetails ? `\n\nDetails:\n${errorDetails}` : '');
      setError(fullErrorMessage);
      Alert.alert('Save Failed', fullErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBill = (billId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this bill?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
                await apiClient.delete(`/bills/${billId}`);
                Alert.alert("Success", "Bill deleted successfully");
                fetchBills();
            } catch (error: any) {
                Alert.alert("Error", error.response?.data?.message || "Failed to delete bill");
            }
        }}
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    try {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setNewBill({ ...newBill, photo: result.assets[0] });
        }
    } catch (error) {
        console.error("ImagePicker Error: ", error);
        Alert.alert('Image Error', 'Could not select image.')
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }
    try {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setNewBill({ ...newBill, photo: result.assets[0] });
        }
    } catch (error) {
        console.error("Camera Error: ", error);
        Alert.alert('Camera Error', 'Could not take photo.')
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText>Loading bills...</ThemedText>
      </ThemedView>
    );
  }

  if (error && bills.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.danger} />
        <ThemedText type="subtitle" style={{color: Colors.light.danger, marginTop:10}}>Error Loading Bills</ThemedText>
        <ThemedText style={{textAlign: 'center', marginHorizontal: 20}}>{error}</ThemedText>
        <View style={styles.buttonWrapperRetry}>
          <Button title="Try Again" onPress={fetchBills} color={Colors.light.tint} />
        </View>
      </ThemedView>
    );
  }

  const chartData = bills.map(bill => ({ x: new Date(bill.dueDate), y: bill.amount })).sort((a,b) => a.x.getTime() - b.x.getTime());

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.tint]} />}
    >
      <ThemedView style={styles.contentContainer}>
        <View style={styles.headerActions}>
            <ThemedText type="title" style={styles.screenTitle}>Water Bills</ThemedText>
        </View>
        <View style={styles.buttonWrapperMarginBtm}>
          <Button title="Add New Bill" onPress={openAddBillModal} color={Colors.light.highlight} />
        </View>

        {bills.length === 0 && !loading ? (
          <ThemedView style={[styles.card, styles.centered, {minHeight: 150}]}>
            <Ionicons name="document-text-outline" size={48} color={Colors.light.icon} />
            <ThemedText type="subtitle" style={{marginTop:10}}>No Bills Recorded</ThemedText>
            <ThemedText style={{textAlign: 'center'}}>Tap 'Add New Bill' to get started.</ThemedText>
          </ThemedView>
        ) : (
          bills.map(bill => (
            <ThemedView key={bill.id} style={styles.card}>
              <View style={styles.billHeader}>
                <ThemedText type="subtitle">${bill.amount.toFixed(2)}</ThemedText>
                <ThemedText>Due: {formatDate(bill.dueDate)}</ThemedText>
              </View>
              <ThemedText>Water Used: {bill.waterUsed} L</ThemedText>
              <ThemedText>Period: {formatDate(bill.billPeriodStart)} - {formatDate(bill.billPeriodEnd)}</ThemedText>
              {bill.photoUrl && 
              <Image
                  source={{ uri: BASE_URL + bill.photoUrl }}
                  contentFit="scale-down"
                  transition={1000}
                  style={{
                    height: 200,
                    backgroundColor: '#0553'
                  }}

                />
              }
              <View style={styles.billActionsContainer}>
                <TouchableOpacity style={styles.billAction} onPress={() => openEditBillModal(bill)}>
                  <Ionicons name="pencil-outline" size={20} color={Colors.light.detailsBase} />
                  <ThemedText style={styles.billActionText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.billAction, {borderColor: Colors.light.danger}]} onPress={() => handleDeleteBill(bill.id)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
                  <ThemedText style={[styles.billActionText, {color: Colors.light.danger}]}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setEditingBill(null);
          }}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollViewContainer}>
            <ThemedView style={styles.modalContent}>
              <ThemedText type="subtitle" style={styles.modalTitle}>{editingBill ? 'Edit Bill' : 'Add New Bill'}</ThemedText>
              
              <ThemedText style={styles.label}>Amount ($)</ThemedText>
              <TextInput 
                placeholder="e.g., 75.50" 
                value={newBill.amount} 
                onChangeText={text => setNewBill({...newBill, amount: text})} 
                style={styles.input} 
                keyboardType="numeric" 
              />
              
              <ThemedText style={styles.label}>Water Used (Liters)</ThemedText>
              <TextInput 
                placeholder="e.g., 1200" 
                value={newBill.waterUsed} 
                onChangeText={text => setNewBill({...newBill, waterUsed: text})} 
                style={styles.input} 
                keyboardType="numeric" 
              />
              
              <ThemedText style={styles.label}>Due Date *</ThemedText>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker('dueDate')}
              >
                <ThemedText>{formatDate(newBill.dueDate)}</ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.label}>Bill Period Start Date (Optional)</ThemedText>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker('startDate')}
              >
                <ThemedText>{newBill.billPeriodStart ? formatDate(newBill.billPeriodStart) : 'Not set'}</ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.label}>Bill Period End Date (Optional)</ThemedText>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker('endDate')}
              >
                <ThemedText>{newBill.billPeriodEnd ? formatDate(newBill.billPeriodEnd) : 'Not set'}</ThemedText>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={showDatePicker === 'dueDate' ? newBill.dueDate : 
                         showDatePicker === 'startDate' ? (newBill.billPeriodStart || new Date()) : 
                         (newBill.billPeriodEnd || new Date())}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}

              <View style={styles.imagePickerContainer}>
                <TouchableOpacity onPress={pickImage} style={[styles.imagePickerButton, styles.roundedButton]}>
                  <Ionicons name="images-outline" size={24} color={Colors.light.highlight} />
                  <ThemedText style={{marginLeft: 10, color: Colors.light.highlight}}>
                    Choose from Gallery
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={takePhoto} style={[styles.imagePickerButton, styles.roundedButton, {marginTop: 10}]}>
                  <Ionicons name="camera-outline" size={24} color={Colors.light.highlight} />
                  <ThemedText style={{marginLeft: 10, color: Colors.light.highlight}}>
                    Take Photo
                  </ThemedText>
                </TouchableOpacity>

                {(newBill.photo?.uri || editingBill?.photoUrl) && (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: newBill.photo?.uri || editingBill?.photoUrl }} 
                      style={styles.previewImage} 
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setNewBill({ ...newBill, photo: null })}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.light.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {error && <ThemedText style={styles.modalErrorText}>{error}</ThemedText>}

              <View style={styles.modalActions}>
                <View style={styles.buttonWrapperModal}>
                    <Button title="Cancel" onPress={() => { setModalVisible(false); setEditingBill(null); }} color={Colors.light.detailsBase} />
                </View>
                <View style={styles.buttonWrapperModal}>
                    <Button title={isSubmitting ? "Saving..." : "Save Bill"} onPress={handleSaveBill} disabled={isSubmitting} color={Colors.light.highlight} />
                </View>
              </View>
            </ThemedView>
            </ScrollView>
          </View>
        </Modal>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  contentContainer: { padding: 15, paddingBottom: 30 },
  centered: { justifyContent: 'center', alignItems: 'center', flex:1 },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  screenTitle: { flex: 1, fontSize: 24, fontWeight: 'bold', color: Colors.light.text },
  buttonWrapper: { borderRadius: 8, overflow: 'hidden' },
  buttonWrapperMarginBtm: { borderRadius: 8, overflow: 'hidden', marginBottom: 15 },
  buttonWrapperModal: { borderRadius: 8, overflow: 'hidden', marginHorizontal: 5, flex: 1 },
  buttonWrapperRetry: { marginTop: 20, borderRadius: 8, overflow: 'hidden' },
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
  billHeader: { marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  billAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  billActionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.detailsBase,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalScrollViewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexGrow: 1,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    marginVertical: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 5,
    opacity: 0.8,
  },
  input: {
    height: 50,
    borderColor: Colors.light.detailsBase,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  imagePickerContainer: {
    marginVertical: 15,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.componentBase,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  roundedButton: { borderRadius: 8 },
  imagePreviewContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  modalErrorText: {
    color: Colors.light.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  graphPlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    backgroundColor: Colors.light.background
  },
  graphTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  graphPlaceholderText: {
    textAlign: 'center',
    color: Colors.light.text,
    opacity: 0.7
  },
  dateInput: {
    height: 50,
    borderColor: Colors.light.detailsBase,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
}); 