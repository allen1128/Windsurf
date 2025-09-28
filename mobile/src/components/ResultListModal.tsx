import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { BackendBookDTO } from '../services/api';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  results: BackendBookDTO[];
  onSelect: (item: BackendBookDTO) => void;
};

export default function ResultListModal({ visible, onClose, results, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Search Results</Text>

          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
                <Text style={styles.itemTitle}>{item.title || 'Untitled'}</Text>
                {item.author ? <Text style={styles.itemMeta}>{item.author}</Text> : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No results</Text>}
          />

          <PrimaryButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  item: {
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  itemTitle: {
    fontWeight: '700',
    color: '#111',
  },
  itemMeta: {
    marginTop: 2,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 16,
  },
});
