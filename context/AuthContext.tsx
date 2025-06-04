import { User } from '@/types';
import { authAPI } from '@/utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true);
      try {
        const [storedToken, storedUserJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY)
        ]);

        if (storedToken && storedUserJson) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserJson));
        }
      } catch (e) {
        console.error("Failed to load auth data", e);
        await logout();
      }
      setIsLoading(false);
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (token && !inAuthGroup) {
      router.replace('/(tabs)/home');
    } else if (!token && inAuthGroup) {
      router.replace('/login');
    }
  }, [token, segments, isLoading, router]);

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { token: authToken, id, name: userName, email: userEmail } = response.data;
      
      // Store the token and user data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify({ id, name: userName, email: userEmail, token: authToken }))
      ]);

      setToken(authToken);
      setUser({ id, name: userName, email: userEmail, token: authToken });
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: authToken, id, name: userName, email: userEmail } = response.data;
      
      // Store the token and user data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify({ id, name: userName, email: userEmail, token: authToken }))
      ]);

      setToken(authToken);
      setUser({ id, name: userName, email: userEmail, token: authToken });
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      setUser(null);
      setToken(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser: User = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        token: token || undefined
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated: !!token, 
        isLoading, 
        login, 
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 