import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

export type AuthMode = 'signIn' | 'signUp';

export type AuthScreenProps = {
  onAuthenticated: () => void;
};

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === 'signIn' ? 'Welcome back' : 'Create your account'), [mode]);
  const subtitle = useMemo(
    () => (mode === 'signIn' ? 'Sign in to your library' : 'Start building your home library'),
    [mode]
  );

  const canSubmit = useMemo(() => {
    const emailOk = /.+@.+\..+/.test(email.trim());
    const passOk = password.length >= 6;
    if (mode === 'signUp') {
      return name.trim().length >= 2 && emailOk && passOk;
    }
    return emailOk && passOk;
  }, [name, email, password, mode]);

  const submit = async () => {
    try {
      setLoading(true);
      // TODO: integrate with backend / AWS Cognito per README
      await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
      onAuthenticated();
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}> 
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.form}>
        {mode === 'signUp' && (
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="Jane Doe"
            returnKeyType="next"
          />
        )}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          returnKeyType="next"
          style={styles.field}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
          returnKeyType="go"
          style={styles.field}
        />

        {mode === 'signIn' && (
          <TouchableOpacity onPress={() => Alert.alert('Password reset', 'Coming soon')}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <PrimaryButton title={mode === 'signIn' ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} disabled={!canSubmit} style={styles.submit} />
      </View>

      <View style={styles.footer}>
        {mode === 'signIn' ? (
          <Text style={styles.footerText}>
            New here?{' '}
            <Text style={styles.footerCta} onPress={() => setMode('signUp')}>Create an account</Text>
          </Text>
        ) : (
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerCta} onPress={() => setMode('signIn')}>Sign in</Text>
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.skip} onPress={onAuthenticated}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  form: {
    gap: 12,
    marginTop: 4,
  },
  field: {
  },
  forgot: {
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '600',
  },
  submit: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#4B5563',
  },
  footerCta: {
    color: '#111827',
    fontWeight: '700',
  },
  skip: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  skipText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
