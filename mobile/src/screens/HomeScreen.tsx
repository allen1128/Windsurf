import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import BookshelfGrid from '../components/BookshelfGrid';
import { MOCK_BOOKS } from '../mock/books';
import type { Book } from '../types';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Array<any>>([]);

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

  // When lookup results don't have a backend id, generate a placeholder numeric id
const getBookIdForAdd = (item: any): number => {
    if (item?.id != null) return Number(item.id);
    const raw = (item?.isbn13 || item?.isbn10 || '').toString().replace(/\D/g, '');
    if (raw.length > 0) {
      // Use the last 9 digits to keep it within a safe integer range
      return Number(raw.slice(-9));
    }
    return Date.now();
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

  const addToLibraryByPayload = async (book: any, genre?: string) => {
    const res = await fetch(`${API_BASE}/add-to-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, genreShelf: genre || 'General', ageShelf: '' }),
    });
    if (!res.ok) {
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch {}
      throw new Error(`Add to library failed (${res.status}): ${bodyText || 'no response body'}`);
    }
    return await res.json();
  };

  const onSubmitSearch = async () => {
    const q = searchText.trim();
    if (!q) return;
    try {
      setSearching(true);
      const found = await lookupBooks(q);
      setResults(found || []);
      if (!found || found.length === 0) {
        Alert.alert('No results', 'No matching books found.');
      } else if (found.length === 1) {
        // Auto prompt for single result
        const b = found[0];
        Alert.alert(
          'Add to Library?',
          `${b.title} by ${b.author || 'Unknown'}\nGenre: ${b.genre || 'N/A'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add',
              onPress: async () => {
                try {
                  await addToLibraryByPayload(b, b.genre);
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
    } finally {
      setSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Your Library</Text>
        <Text style={styles.subtitle}>Find, scan, and organize</Text>
      </View>


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

      {/* Add button (FAB) */}
      <TouchableOpacity style={styles.addFab} onPress={() => { setAddOpen(true); setResults([]); setSearchText(''); }}>
        <Text style={styles.addFabText}>Add</Text>
      </TouchableOpacity>

      {/* Add/Search Modal */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add a Book</Text>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={onSubmitSearch}
              returnKeyType="search"
              placeholder="Enter ISBN or title"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddOpen(false)} style={[styles.actionBtn, styles.cancelBtn]}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmitSearch} style={[styles.actionBtn, styles.searchBtn]}>
                {searching ? <ActivityIndicator color="white" /> : <Text style={styles.actionText}>Search</Text>}
              </TouchableOpacity>
            </View>

            {results.length > 0 && (
              <FlatList
                data={results}
                keyExtractor={(item, index) => {
                  if (item?.id != null) return String(item.id);
                  const isbn = item?.isbn13 || item?.isbn10;
                  if (isbn) return String(isbn);
                  const title = item?.title || 'untitled';
                  const author = item?.author || 'unknown';
                  return `${title}-${author}-${index}`;
                }}
                contentContainerStyle={{ paddingTop: 8 }}
                renderItem={({ item }) => (
                  <View style={styles.resultRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.resultMeta} numberOfLines={1}>{item.author || 'Unknown'} • {item.genre || 'N/A'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addRowBtn}
                      onPress={async () => {
                        try {
                          await addToLibraryByPayload(item, item.genre);
                          Alert.alert('Added', 'The book was added to your library.');
                          setAddOpen(false);
                        } catch (e: any) {
                          Alert.alert('Error', e?.message || 'Failed to add.');
                        }
                      }}
                    >
                      <Text style={styles.addRowBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  addFab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addFabText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  searchBtn: {
    backgroundColor: '#4F46E5',
  },
  actionText: {
    color: '#111',
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  resultTitle: {
    fontSize: 15,
    color: '#111',
    fontWeight: '700',
  },
  resultMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addRowBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addRowBtnText: {
    color: 'white',
    fontWeight: '700',
  },
});
