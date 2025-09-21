import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, GestureResponderEvent } from 'react-native';

export type FloatingScanButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
};

export default function FloatingScanButton({ onPress }: FloatingScanButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.button}>
        <Text style={styles.plus}>＋</Text>
        <Text style={styles.label}>Scan</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plus: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
