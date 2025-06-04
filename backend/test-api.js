const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';
let categoryId = '';
let deviceId = '';
let usageId = '';
let billId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    },
    ...(data ? { data } : {})
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test user registration and login
const testUserAuth = async () => {
  console.log('\n=== Testing User Authentication ===');
  
  try {
    // Register new user
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const registerResponse = await makeRequest('post', '/users/register', registerData);
    console.log('User registered:', registerResponse);
    userId = registerResponse.id;
    authToken = registerResponse.token;

    // Login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await makeRequest('post', '/users/login', loginData);
    console.log('User logged in:', loginResponse);
    authToken = loginResponse.token;
  } catch (error) {
    console.error('User authentication test failed:', error.message);
    throw error;
  }
};

// Test categories
const testCategories = async () => {
  console.log('\n=== Testing Categories ===');
  
  try {
    // Create category
    const categoryData = {
      name: 'Kitchen',
      iconName: 'kitchen'
    };
    
    const categoryResponse = await makeRequest('post', '/categories', categoryData);
    console.log('Category created:', categoryResponse);
    categoryId = categoryResponse.id;

    // Get all categories
    const categories = await makeRequest('get', '/categories');
    console.log('All categories:', categories);

    // Update category
    const updateData = {
      name: 'Updated Kitchen',
      iconName: 'kitchen-updated'
    };
    
    const updatedCategory = await makeRequest('patch', `/categories/${categoryId}`, updateData);
    console.log('Updated category:', updatedCategory);
  } catch (error) {
    console.error('Categories test failed:', error.message);
    throw error;
  }
};

// Test devices
const testDevices = async () => {
  console.log('\n=== Testing Devices ===');
  
  try {
    // Create device
    const deviceData = {
      name: 'Kitchen Sink',
      categoryId: categoryId
    };
    
    const deviceResponse = await makeRequest('post', '/devices', deviceData);
    console.log('Device created:', deviceResponse);
    deviceId = deviceResponse.id;

    // Get all devices
    const devices = await makeRequest('get', '/devices');
    console.log('All devices:', devices);

    // Update device
    const updateData = {
      name: 'Updated Kitchen Sink',
      categoryId: categoryId // Include categoryId in update
    };
    
    const updatedDevice = await makeRequest('patch', `/devices/${deviceId}`, updateData);
    console.log('Updated device:', updatedDevice);
  } catch (error) {
    console.error('Devices test failed:', error.message);
    throw error;
  }
};

// Test usage
const testUsage = async () => {
  console.log('\n=== Testing Usage ===');
  
  try {
    // Create usage record
    const usageData = {
      deviceId: deviceId,
      value: 5.5,
      notes: 'Morning dishes'
    };
    
    const usageResponse = await makeRequest('post', '/usages', usageData);
    console.log('Usage created:', usageResponse);
    usageId = usageResponse.id;

    // Get all usage records
    const usages = await makeRequest('get', '/usages');
    console.log('All usage records:', usages);

    // Get usage by device
    const deviceUsages = await makeRequest('get', `/usages/device/${deviceId}`);
    console.log('Device usage records:', deviceUsages);

    // Update usage
    const updateData = {
      value: 6.0,
      notes: 'Updated morning dishes'
    };
    
    const updatedUsage = await makeRequest('patch', `/usages/${usageId}`, updateData);
    console.log('Updated usage:', updatedUsage);
  } catch (error) {
    console.error('Usage test failed:', error.message);
    throw error;
  }
};

// Test bills
const testBills = async () => {
  console.log('\n=== Testing Bills ===');
  
  try {
    // Create bill
    const billData = {
      amount: 45.50,
      dueDate: '2024-04-15',
      waterUsed: 12.5,
      billPeriodStart: '2024-03-01',
      billPeriodEnd: '2024-03-31'
    };
    
    const billResponse = await makeRequest('post', '/bills', billData);
    console.log('Bill created:', billResponse);
    billId = billResponse.id;

    // Get all bills
    const bills = await makeRequest('get', '/bills');
    console.log('All bills:', bills);

    // Mark bill as paid
    const paidData = {
      paidDate: '2024-04-10'
    };
    
    const paidBill = await makeRequest('patch', `/bills/${billId}/paid`, paidData);
    console.log('Marked bill as paid:', paidBill);

    // Update bill
    const updateData = {
      amount: 50.00,
      waterUsed: 15.0
    };
    
    const updatedBill = await makeRequest('patch', `/bills/${billId}`, updateData);
    console.log('Updated bill:', updatedBill);
  } catch (error) {
    console.error('Bills test failed:', error.message);
    throw error;
  }
};

// Run all tests
const runTests = async () => {
  try {
    await testUserAuth();
    await testCategories();
    await testDevices();
    await testUsage();
    await testBills();
    console.log('\n=== All tests completed successfully! ===');
  } catch (error) {
    console.error('\n=== Test failed:', error.message);
    process.exit(1);
  }
};

// Start the tests
runTests(); 