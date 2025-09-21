import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import BookshelfGrid from '../components/BookshelfGrid';
import FloatingScanButton from '../components/FloatingScanButton';
import { MOCK_BOOKS } from '../mock/books';
import type { Book } from '../types';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('All');

  const genres = useMemo(() => {
    const unique = new Set<string>(['All']);
    MOCK_BOOKS.forEach(b => unique.add(b.genre));
    return Array.from(unique);
  }, []);

  const filtered: Book[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_BOOKS.filter(b => {
      const matchesQuery = q.length === 0 ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchesGenre = activeGenre === 'All' || b.genre === activeGenre;
      return matchesQuery && matchesGenre;
    });
  }, [query, activeGenre]);

  const onScan = () => {
    // TODO: Hook into camera/barcode flow in future iterations
    console.log('Scan tapped');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Your Library</Text>
          <Text style={styles.subtitle}>Find, scan, and organize</Text>
        </View>

        <SearchBar value={query} onChangeText={setQuery} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
          {genres.map(g => (
            <TouchableOpacity
              key={g}
              onPress={() => setActiveGenre(g)}
              style={[styles.chip, activeGenre === g && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeGenre === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.gridWrapper}>
          <BookshelfGrid books={filtered} onPressBook={(b) => console.log('Pressed', b.title)} />
        </View>
      </ScrollView>

      <FloatingScanButton onPress={onScan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginBottom: 12,
  },
  chips: {
    marginTop: 12,
  },
  chipsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f0f0f5',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
  },
  chipTextActive: {
    color: 'white',
  },
  gridWrapper: {
    marginTop: 12,
  },
});
