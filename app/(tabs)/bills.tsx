import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Bill } from '@/types';
import apiClient from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// import { VictoryLine, VictoryChart, VictoryAxis, VictoryLabel } from 'victory-native';

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

interface NewBillData {
    amount: string;
    waterUsed: string;
    dueDate: string; // Keep as string for input, convert on submit
    billPeriodStart: string;
    billPeriodEnd: string;
    photo: ImagePicker.ImagePickerAsset | null;
}

const initialNewBillState: NewBillData = {
    amount: '',
    waterUsed: '',
    dueDate: '',
    billPeriodStart: '',
    billPeriodEnd: '',
    photo: null,
};

export default function BillsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBill, setNewBill] = useState<NewBillData>(initialNewBillState);
  const [editingBill, setEditingBill] = useState<Bill | null>(null); // For editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComparisonGraph, setShowComparisonGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ bills: Bill[] }>('/bills?limit=12&sort=dueDate:desc'); // Fetch last 12, newest first
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
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0], // Format for date input
        billPeriodStart: new Date(bill.billPeriodStart).toISOString().split('T')[0],
        billPeriodEnd: new Date(bill.billPeriodEnd).toISOString().split('T')[0],
        photo: null, // Photo re-upload would be needed for edit, or handle existing photoUrl
    });
    setModalVisible(true);
  };

  const handleSaveBill = async () => {
    if (!newBill.amount || !newBill.waterUsed || !newBill.dueDate || !newBill.billPeriodStart || !newBill.billPeriodEnd) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('amount', newBill.amount);
      formData.append('waterUsed', newBill.waterUsed);
      formData.append('dueDate', new Date(newBill.dueDate).toISOString());
      formData.append('billPeriodStart', new Date(newBill.billPeriodStart).toISOString());
      formData.append('billPeriodEnd', new Date(newBill.billPeriodEnd).toISOString());
      // TODO: Add userId if not handled by backend through auth token

      if (newBill.photo) {
        const uriParts = newBill.photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('billImage', {
          uri: newBill.photo.uri,
          name: `bill_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      if (editingBill) {
        // Update existing bill
        // await apiClient.put(`/bills/${editingBill.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Bill updated! (Mocked)');
      } else {
        // Add new bill
        // await apiClient.post('/bills', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Success', 'Bill added! (Mocked)');
      }
      
      setModalVisible(false);
      setNewBill(initialNewBillState);
      setEditingBill(null);
      fetchBills(); // Refresh list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save bill.';
      setError(errorMessage);
      Alert.alert('Save Failed', errorMessage);
    }
    setIsSubmitting(false);
  };

  const handleDeleteBill = (billId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this bill?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
                // await apiClient.delete(`/bills/${billId}`);
                Alert.alert("Success", "Bill deleted (Mocked)");
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
            quality: 0.8, // Slightly reduced quality for faster uploads
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setNewBill({ ...newBill, photo: result.assets[0] });
        }
    } catch (error) {
        console.error("ImagePicker Error: ", error);
        Alert.alert('Image Error', 'Could not select image.')
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
            {bills.length > 1 && (
                <View style={styles.buttonWrapper}>
                    <Button title={showComparisonGraph ? "Hide Graph" : "Show Graph"} onPress={() => setShowComparisonGraph(!showComparisonGraph)} color={Colors.light.detailsBase} />
                </View>
            )}
        </View>
        <View style={styles.buttonWrapperMarginBtm}>
          <Button title="Add New Bill" onPress={openAddBillModal} color={Colors.light.highlight} />
        </View>

        {showComparisonGraph && bills.length > 1 && (
            <ThemedView style={styles.card}>
                <ThemedText type="subtitle" style={styles.graphTitle}>Last {bills.length} Bills Comparison</ThemedText>
                <View style={styles.graphPlaceholder}>
                    <ThemedText style={styles.graphPlaceholderText}>
                        Comparison Graph Area: Install 'victory-native'.
                        {/* Data points: {chartData.length} */}
                    </ThemedText>
                    {/* <VictoryChart domainPadding={{ x: 20 }} height={250} scale={{ x: "time" }}>
                        <VictoryAxis dependentAxis tickFormat={(tick) => `$${tick}`} />
                        <VictoryAxis 
                            tickCount={Math.min(6, chartData.length)} 
                            tickFormat={(t) => new Date(t).toLocaleDateString('en-US', {month: 'short', year: '2-digit'})} 
                            style={{ tickLabels: { angle: Platform.OS === 'ios' ? -30 : 0, textAnchor: Platform.OS === 'ios' ? 'end' : 'middle'} }}
                        />
                        <VictoryLine data={chartData} style={{ data: { stroke: Colors.light.highlight } }} />
                    </VictoryChart> */}
                </View>
            </ThemedView>
        )}

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
                <TouchableOpacity onPress={() => Alert.alert("View Photo", "Implement photo viewer for " + bill.photoUrl)}>
                    <ThemedText style={{color: Colors.light.tint, textDecorationLine: 'underline'}}>View Bill Photo</ThemedText>
                </TouchableOpacity>}
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
            setEditingBill(null); // Clear editing state on modal close
          }}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollViewContainer}>
            <ThemedView style={styles.modalContent}>
              <ThemedText type="subtitle" style={styles.modalTitle}>{editingBill ? 'Edit Bill' : 'Add New Bill'}</ThemedText>
              
              <ThemedText style={styles.label}>Amount ($)</ThemedText>
              <TextInput placeholder="e.g., 75.50" value={newBill.amount} onChangeText={text => setNewBill({...newBill, amount: text})} style={styles.input} keyboardType="numeric" />
              
              <ThemedText style={styles.label}>Water Used (Liters)</ThemedText>
              <TextInput placeholder="e.g., 1200" value={newBill.waterUsed} onChangeText={text => setNewBill({...newBill, waterUsed: text})} style={styles.input} keyboardType="numeric" />
              
              <ThemedText style={styles.label}>Due Date</ThemedText>
              <TextInput placeholder="YYYY-MM-DD" value={newBill.dueDate} onChangeText={text => setNewBill({...newBill, dueDate: text})} style={styles.input} />

              <ThemedText style={styles.label}>Bill Period Start Date</ThemedText>
              <TextInput placeholder="YYYY-MM-DD" value={newBill.billPeriodStart} onChangeText={text => setNewBill({...newBill, billPeriodStart: text})} style={styles.input} />

              <ThemedText style={styles.label}>Bill Period End Date</ThemedText>
              <TextInput placeholder="YYYY-MM-DD" value={newBill.billPeriodEnd} onChangeText={text => setNewBill({...newBill, billPeriodEnd: text})} style={styles.input} />
              
              <TouchableOpacity onPress={pickImage} style={[styles.imagePickerButton, styles.roundedButton]}>
                <Ionicons name="camera-outline" size={24} color={Colors.light.highlight} />
                <ThemedText style={{marginLeft: 10, color: Colors.light.highlight}}>
                  {newBill.photo ? 'Image Selected' : (editingBill && editingBill.photoUrl ? 'Replace Photo (Optional)' : 'Upload Bill Photo (Optional)')}
                </ThemedText>
              </TouchableOpacity>
              {newBill.photo?.uri && 
                <Image source={{ uri: newBill.photo.uri }} style={styles.previewImage} />
              }
              {!newBill.photo && editingBill?.photoUrl &&
                 <Image source={{ uri: editingBill.photoUrl }} style={styles.previewImage} /> // Show existing photo if editing and no new one picked
              }

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
  contentContainer: { padding: 15, paddingBottom: 30 }, // Added paddingBottom
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
    flexGrow: 1, // Important for ScrollView in Modal
  },
  modalContent: {
    width: '90%',
    maxWidth: 400, // Max width for larger screens
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    marginVertical: 20, // Allow scroll if content overflows
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
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.componentBase,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
  },
  roundedButton: { borderRadius: 8 },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.light.detailsBase,
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
  }
}); 