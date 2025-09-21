import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { Book } from '../types';

export type BookCardProps = {
  book: Book;
  onPress?: (book: Book) => void;
};

export default function BookCard({ book, onPress }: BookCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(book)} activeOpacity={0.8}>
      <View style={styles.coverWrapper}>
        <Image
          source={{ uri: book.coverUrl || 'https://via.placeholder.com/200x300?text=Book' }}
          style={styles.cover}
          resizeMode="cover"
        />
        {book.ageMin != null && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{book.ageMin}{book.ageMax ? `-${book.ageMax}` : '+'}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  coverWrapper: {
    aspectRatio: 2/3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 6,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#111',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
});
