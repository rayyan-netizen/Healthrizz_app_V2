import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

type Mode = 'login' | 'signup';

export default function Login() {
  const session = useAuthStore((s) => s.session);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error, needsEmailConfirmation } = await signUp(email, password);
      if (error) {
        setError(error);
      } else if (needsEmailConfirmation) {
        setInfo('Account created — check your email to confirm before logging in.');
      }
    }

    setLoading(false);
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
    setInfo(null);
  };

  return (
    <View className="flex-1 justify-center gap-3 bg-warm px-6">
      <Image
        source={require('../assets/brand/mascot.png')}
        className="mb-2 h-32 w-32 self-center"
        resizeMode="contain"
      />
      <Text className="mb-4 text-center text-2xl font-nunito-extrabold text-ink">
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        className="rounded-kid border border-primary-200 bg-white px-4 py-3 font-nunito text-ink"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        className="rounded-kid border border-primary-200 bg-white px-4 py-3 font-nunito text-ink"
      />
      {error ? <Text className="font-nunito text-red-500">{error}</Text> : null}
      {info ? <Text className="font-nunito text-secondary-600">{info}</Text> : null}
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="mt-2 items-center rounded-kid bg-primary-500 px-6 py-3 active:bg-primary-600"
      >
        <Text className="font-nunito-bold text-ink">
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </Text>
      </Pressable>
      <Pressable onPress={switchMode} className="items-center py-3">
        <Text className="font-nunito text-primary-800">
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </Text>
      </Pressable>
    </View>
  );
}
