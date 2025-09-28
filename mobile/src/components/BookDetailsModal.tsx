import React from 'react';
import { Modal, View, Text, StyleSheet, Image } from 'react-native';
import PrimaryButton from './PrimaryButton';
import type { BackendBookDTO } from '../services/api';

type Props = {
  visible: boolean;
  onClose: () => void;
  book: BackendBookDTO | null;
  onAdd?: () => void;
  onAddPress?: (book: BackendBookDTO, shelves: string[]) => Promise<void> | void;
};

export default function BookDetailsModal({ visible, onClose, book, onAdd, onAddPress }: Props) {
  const handleAdd = async () => {
    if (!book) return;
    try {
      if (onAddPress) {
        await onAddPress(book, ['General']);
      }
      onAdd?.();
    } finally {
      // do nothing
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{book?.title || 'Book details'}</Text>
          {book?.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.cover} />
          ) : null}
          {book?.author ? <Text style={styles.meta}>By {book.author}</Text> : null}
          {book?.genre ? <Text style={styles.meta}>Genre: {book.genre}</Text> : null}
          {(book?.isbn13 || book?.isbn10) ? (
            <Text style={styles.meta}>ISBN: {book?.isbn13 || book?.isbn10}</Text>
          ) : null}
          {book?.description ? <Text style={styles.description}>{book.description}</Text> : null}

          <View style={styles.row}>
            <PrimaryButton title="Close" onPress={onClose} />
            <View style={{ width: 12 }} />
            <PrimaryButton title="Add to Library" onPress={handleAdd} />
          </View>
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
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111',
  },
  cover: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  meta: {
    color: '#555',
    marginBottom: 4,
  },
  description: {
    marginTop: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});
