import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, FlatList, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import BookshelfGrid from '../components/BookshelfGrid';
// import { MOCK_BOOKS } from '../mock/books'; // replaced by backend-loaded library
import type { Book } from '../types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  // Store canonical genre key (lowercased). 'all' means no filter.
  const [activeGenre, setActiveGenre] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Array<any>>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Helpers to canonicalize genre
  const normalizeGenre = (s?: string) => {
    const key = (s || '').trim().toLowerCase();
    return key.length === 0 ? 'general' : key;
  };

  // Title Case helper for display labels
  const toTitleCase = (s: string) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');

  // Build map: canonical key -> display label (first seen)
  const genreMap = useMemo(() => {
    const m = new Map<string, string>();
    books.forEach(b => {
      const key = normalizeGenre(b.genre);
      if (!m.has(key)) m.set(key, toTitleCase(b.genre || 'General'));
    });
    return m;
  }, [books]);

  // Chips list: include All first, then mapped genres
  const genres = useMemo(() => {
    const arr: Array<{ key: string; label: string }> = [{ key: 'all', label: 'All' }];
    genreMap.forEach((label, key) => arr.push({ key, label }));
    return arr;
  }, [genreMap]);

  const filtered: Book[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter(b => {
      const matchesQuery = q.length === 0 ||
        (b.title?.toLowerCase().includes(q)) ||
        (b.author?.toLowerCase().includes(q));
      const matchesGenre = activeGenre === 'all' || normalizeGenre(b.genre) === activeGenre;
      return matchesQuery && matchesGenre;
    });
  }, [books, query, activeGenre]);

  // Load user's library from backend
  const loadLibrary = async () => {
    try {
      setLoadingLibrary(true);
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error(`Load library failed (${res.status})`);
      const data = await res.json();
      const mapped: Book[] = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: String(d.id ?? d.isbn ?? Date.now()),
        title: d.title ?? 'Untitled',
        author: d.author ?? 'Unknown',
        genre: d.genreShelf || d.genre || 'General',
        coverUrl: (d.coverImageUrl || d.coverUrl)?.replace(/^http:\/\//, 'https://'),
        isbn: d.isbn,
        description: d.description,
        publisher: d.publisher,
        publicationYear: d.publicationYear,
        pageCount: d.pageCount,
        genreShelf: d.genreShelf,
        ageShelf: d.ageShelf,
      }));
      setBooks(mapped);
    } catch (e) {
      console.warn('Failed to load library', e);
      setBooks([]);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

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
                  // Refresh library list
                  loadLibrary();
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


      <View style={[styles.chips, styles.chipsContent]}>
        {genres.map(g => (
          <TouchableOpacity
            key={g.key}
            onPress={() => setActiveGenre(g.key)}
            style={[styles.chip, activeGenre === g.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeGenre === g.key && styles.chipTextActive]}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.gridWrapper}>
        <BookshelfGrid
          books={filtered}
          onPressBook={(b) => {
            setSelectedBook(b);
            setDetailsOpen(true);
          }}
        />
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
                          // Refresh library list
                          loadLibrary();
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

      {/* Book Details Modal */}
      <Modal visible={detailsOpen} animationType="slide" onRequestClose={() => setDetailsOpen(false)}>
        <SafeAreaView style={styles.detailsContainer}>
          <View style={[styles.detailsHeader, { paddingTop: insets.top + 6 }]}>
            <View style={{ width: 60 }}>
              <TouchableOpacity onPress={() => setDetailsOpen(false)} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.detailsTitle} numberOfLines={1}>Book Details</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator>
            {selectedBook && (
              <>
                <View style={styles.detailsTopRow}>
                  <Image
                    source={{ uri: selectedBook.coverUrl || 'https://via.placeholder.com/200x300?text=Book' }}
                    style={styles.detailsCover}
                  />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.detailsBookTitle}>{selectedBook.title}</Text>
                    <Text style={styles.detailsAuthor}>{selectedBook.author || 'Unknown'}</Text>
                    <Text style={styles.detailsMeta}>
                      {toTitleCase(selectedBook.genre || 'General')}
                      {selectedBook.isbn ? `  •  ISBN ${selectedBook.isbn}` : ''}
                    </Text>
                    {selectedBook.publisher || selectedBook.publicationYear ? (
                      <Text style={styles.detailsMeta}>
                        {(selectedBook.publisher || '') + (selectedBook.publicationYear ? `, ${selectedBook.publicationYear}` : '')}
                        {selectedBook.pageCount ? ` • ${selectedBook.pageCount} pages` : ''}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {selectedBook.description ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedBook.description}</Text>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    flex: 1,
  },
  // Details modal styles
  detailsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  detailsContent: {
    padding: 16,
  },
  detailsTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailsCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  detailsBookTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  detailsAuthor: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  detailsMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
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
