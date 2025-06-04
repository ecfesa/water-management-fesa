import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name, email, password);
      // No need to navigate to login as register will automatically log in the user
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred during registration.';
      setError(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.highlight} style={{marginVertical: 10}} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title='Register' onPress={handleRegister} color={Colors.light.highlight} />
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button 
          title="Already have an account? Login" 
          onPress={() => router.push('/login')} 
          color={Colors.light.detailsBase} 
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.light.text,
  },
  input: {
    height: 50,
    borderColor: Colors.light.componentBase,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: Colors.light.danger || 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
}); 