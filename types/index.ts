// Base types
export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  Category?: {
    name: string;
    iconName?: string;
  };
}

export interface Usage {
  id: string;
  deviceId: string;
  timestamp: string;
  value: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  Device?: {
    name: string;
  };
}

export interface Bill {
  id: string;
  userId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  waterUsed: number;
  billPeriodStart?: string;
  billPeriodEnd?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API Request types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface CreateCategoryRequest {
  name: string;
  iconName?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  iconName?: string;
}

export interface CreateDeviceRequest {
  name: string;
  categoryId: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  categoryId?: string;
}

export interface CreateUsageRequest {
  deviceId: string;
  value: number;
  notes?: string;
}

export interface UpdateUsageRequest {
  value?: number;
  notes?: string;
}

export interface CreateBillRequest {
  amount: number;
  dueDate: string;
  waterUsed: number;
  billPeriodStart?: string;
  billPeriodEnd?: string;
  photoUrl?: string;
}

export interface UpdateBillRequest {
  amount?: number;
  dueDate?: string;
  waterUsed?: number;
  billPeriodStart?: string;
  billPeriodEnd?: string;
  photoUrl?: string;
}

export interface MarkBillAsPaidRequest {
  paidDate: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Array<{
    type: string;
    msg: string;
    path: string;
    location: string;
  }>;
} 