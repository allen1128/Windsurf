import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import BookshelfGrid from '../components/BookshelfGrid';
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

  const API_BASE = 'http://localhost:8080/api/books';

  const isISBN = (txt: string) => {
    const s = txt.replace(/[-\s]/g, '');
    return /^\d{9}[\dXx]$/.test(s) || /^\d{13}$/.test(s);
  };

  const lookupBooks = async (q: string) => {
    const controller = new AbortController();
    const params = isISBN(q) ? `?isbn=${encodeURIComponent(q)}` : `?title=${encodeURIComponent(q)}`;
    const res = await fetch(`${API_BASE}/lookup${params}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
    return (await res.json()) as Array<any>;
  };

  const addToLibrary = async (bookId: number, genre?: string) => {
    const res = await fetch(`${API_BASE}/${bookId}/add-to-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genreShelf: genre || 'General', ageShelf: '' }),
    });
    if (!res.ok) throw new Error(`Add to library failed (${res.status})`);
    return await res.json();
  };

  const onSubmitSearch = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      const results = await lookupBooks(q);
      if (!results || results.length === 0) {
        Alert.alert('No results', 'No matching books found.');
        return;
      }
      if (results.length === 1) {
        const b = results[0];
        Alert.alert(
          'Add to Library?',
          `${b.title} by ${b.author || 'Unknown'}\nGenre: ${b.genre || 'N/A'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add',
              onPress: async () => {
                try {
                  await addToLibrary(b.id, b.genre);
                  Alert.alert('Added', 'The book was added to your library.');
                } catch (e: any) {
                  Alert.alert('Error', e?.message || 'Failed to add.');
                }
              },
            },
          ]
        );
      } else {
        // Multiple results: offer to add the first match, or we could extend with a chooser later
        const b = results[0];
        Alert.alert(
          `Multiple matches (${results.length})`,
          `Add the first match?\n${b.title} by ${b.author || 'Unknown'}\nGenre: ${b.genre || 'N/A'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add First',
              onPress: async () => {
                try {
                  await addToLibrary(b.id, b.genre);
                  Alert.alert('Added', 'The book was added to your library.');
                } catch (e: any) {
                  Alert.alert('Error', e?.message || 'Failed to add.');
                }
              },
            },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Search Error', e?.message || 'Failed to search.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Your Library</Text>
        <Text style={styles.subtitle}>Find, scan, and organize</Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={onSubmitSearch}
        returnKeyType="search"
        placeholder="Search by title or ISBN…"
      />

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
    </SafeAreaView>
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
    paddingTop: 24,
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
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f5',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    alignSelf: 'flex-start',
    flexGrow: 0,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: 'white',
  },
  gridWrapper: {
    marginTop: 12,
  },
});
