import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, FlatList, Image, Linking, Share } from 'react-native';
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
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [recs, setRecs] = useState<Book[]>([]);

  // Helpers to canonicalize genre
  const normalizeGenre = (s?: string) => {
    const key = (s || '').trim().toLowerCase();
    return key.length === 0 ? 'general' : key;
  };

  // Fetch recommendations when opening details
  useEffect(() => {
    const run = async () => {
      if (!detailsOpen || !selectedBook) return;
      setRecsLoading(true);
      setRecsError(null);
      try {
        let items: any[] = [];
        if (selectedBook) {
          try {
            const payload: any = {
              title: selectedBook.title || '',
              description: selectedBook.description || '',
              author: selectedBook.author || '',
              genre: selectedBook.genre || '',
              publisher: selectedBook.publisher || '',
              publicationYear: selectedBook.publicationYear ?? null,
              pageCount: selectedBook.pageCount ?? null,
              genreShelf: selectedBook.genreShelf || '',
              ageShelf: selectedBook.ageShelf || '',
            };
            if (selectedBook.id && /^\d+$/.test(String(selectedBook.id))) {
              payload.bookId = Number(selectedBook.id);
            }
            if (selectedBook.isbn) {
              payload.isbn = selectedBook.isbn;
            }
            const res = await fetch(`${API_BASE}/recommendations/query`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              const json = await res.json();
              // Prefer backend-provided similarBooks (server handles fallback and filtering)
              if (Array.isArray(json?.similarBooks)) {
                const normalized = json.similarBooks.map((b: any) => ({
                  ...b,
                  // normalize to a single field and force https
                  coverUrl: ((b.coverImageUrl || b.coverUrl) ?? '').replace(/^http:\/\//, 'https://'),
                }));
                setRecs(normalized);
              }
            } else {
              // Surface server error to UI for easier debugging
              let msg = '';
              try {
                msg = await res.text();
              } catch {}
              throw new Error(msg || `Recommendations failed (${res.status})`);
            }
          } catch (e: any) {
            setRecsError(e?.message || 'Failed to load recommendations');
            setRecs([]);
          }
        }
      } finally {
        setRecsLoading(false);
      }
    };
    run();
  }, [detailsOpen, selectedBook]);

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

  // Remove from library helper (requires numeric id)
  const removeFromLibrary = async (b: Book) => {
    if (!(b.id && /^\d+$/.test(String(b.id)))) {
      throw new Error('Missing numeric book id to remove');
    }
    const url = `${API_BASE}/${encodeURIComponent(String(b.id))}/remove-from-library`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      let msg = '';
      try { msg = await res.text(); } catch {}
      throw new Error(msg || `Remove failed (${res.status})`);
    }
  };

  const isISBN = (txt: string) => {
    const s = txt.replace(/[-\s]/g, '');
    return /^\d{9}[\dXx]$/.test(s) || /^\d{13}$/.test(s);
  };

  // Helpers for library membership checks (by id only)
  const isInLibrary = (b: any) =>
    books.some(lb => lb.id && b?.id && String(lb.id) === String(b.id));
  const findLibraryBookFor = (b: any) =>
    books.find(lb => lb.id && b?.id && String(lb.id) === String(b.id));

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
                renderItem={({ item }) => {
                  const inLib = isInLibrary(item);
                  return (
                    <View style={styles.resultRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.resultMeta} numberOfLines={1}>{item.author || 'Unknown'} • {item.genre || 'N/A'}</Text>
                      </View>
                      {inLib ? (
                        <TouchableOpacity
                          style={[styles.addRowBtn, { backgroundColor: '#ef4444' }]}
                          onPress={async () => {
                            try {
                              const libBook = findLibraryBookFor(item);
                              if (!libBook || !(libBook.id && /^\d+$/.test(String(libBook.id)))) {
                                throw new Error('Missing library book id to remove');
                              }
                              await removeFromLibrary(libBook);
                              // Optimistically remove from local books and keep modal open to show toggle
                              setBooks(curr => curr.filter(b => String(b.id) !== String(libBook.id)));
                              loadLibrary();
                              Alert.alert('Removed', 'The book was removed from your library.');
                            } catch (e: any) {
                              Alert.alert('Error', e?.message || 'Failed to remove.');
                            }
                          }}
                        >
                          <Text style={styles.addRowBtnText}>Remove</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.addRowBtn}
                          onPress={async () => {
                            try {
                              const added = await addToLibraryByPayload(item, item.genre);
                              // Update this search item with the new backend id so isInLibrary(id) becomes true
                              if (added && added.id != null) {
                                setResults(curr => curr.map(r => {
                                  const sameId = r.id != null && item.id != null && String(r.id) === String(item.id);
                                  const sameIsbn = r.isbn && item.isbn && String(r.isbn) === String(item.isbn);
                                  const sameTitleAuthor = (r.title === item.title) && ((r.author || '') === (item.author || ''));
                                  if (sameId || sameIsbn || sameTitleAuthor) {
                                    return { ...r, id: String(added.id) };
                                  }
                                  return r;
                                }));
                                // Optimistically add to local books so the button toggles immediately
                                setBooks(curr => {
                                  const exists = curr.some(b => String(b.id) === String(added.id));
                                  if (exists) return curr;
                                  const newBook = {
                                    id: String(added.id),
                                    title: added.title || item.title || 'Untitled',
                                    author: added.author || item.author || 'Unknown',
                                    genre: added.genreShelf || added.genre || item.genre || 'General',
                                    coverUrl: (added.coverImageUrl || added.coverUrl || item.coverUrl || '').replace(/^http:\/\//, 'https://'),
                                    isbn: added.isbn || item.isbn,
                                    description: added.description || item.description,
                                    publisher: added.publisher || item.publisher,
                                    publicationYear: added.publicationYear || item.publicationYear,
                                    pageCount: added.pageCount || item.pageCount,
                                    genreShelf: added.genreShelf,
                                    ageShelf: added.ageShelf,
                                  } as any;
                                  return [...curr, newBook];
                                });
                              }
                              Alert.alert('Added', 'The book was added to your library.');
                              // Refresh library list
                              loadLibrary();
                            } catch (e: any) {
                              Alert.alert('Error', e?.message || 'Failed to add.');
                            }
                          }}
                        >
                          <Text style={styles.addRowBtnText}>Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Book Details Modal */}
      <Modal visible={detailsOpen} animationType="slide" onRequestClose={() => setDetailsOpen(false)}>
        <SafeAreaView style={styles.detailsContainer} edges={['left','right']}>
          <View style={[styles.detailsHeader, { paddingTop: insets.top }] }>
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
                    {(selectedBook.genreShelf || selectedBook.ageShelf) ? (
                      <Text style={styles.detailsMeta}>
                        {selectedBook.genreShelf ? `Shelf: ${selectedBook.genreShelf}` : ''}
                        {selectedBook.genreShelf && selectedBook.ageShelf ? '  •  ' : ''}
                        {selectedBook.ageShelf ? `Ages: ${selectedBook.ageShelf}` : ''}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionChip]}
                    onPress={async () => {
                      try {
                        const msg = `${selectedBook.title}${selectedBook.author ? ` — ${selectedBook.author}` : ''}${selectedBook.isbn ? `\nISBN: ${selectedBook.isbn}` : ''}`;
                        await Share.share({ message: msg });
                      } catch {}
                    }}
                  >
                    <Text style={styles.actionChipText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionChip]}
                    onPress={() => {
                      const url = selectedBook.isbn
                        ? `https://books.google.com/books?vid=ISBN${selectedBook.isbn}`
                        : `https://www.google.com/search?q=${encodeURIComponent(selectedBook.title + ' ' + (selectedBook.author || ''))}`;
                      Linking.openURL(url).catch(() => {});
                    }}
                  >
                    <Text style={styles.actionChipText}>Open in Google Books</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionChip]}
                    onPress={async () => {
                      if (!selectedBook) return;
                      const title = selectedBook.title || 'this book';
                      Alert.alert(
                        'Remove from Library',
                        `Are you sure you want to remove "${title}" from your library?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                // Optimistic update
                                const prev = books;
                                setBooks(curr => curr.filter(x => {
                                  const sameId = x.id && selectedBook.id && String(x.id) === String(selectedBook.id);
                                  const sameIsbn = x.isbn && selectedBook.isbn && String(x.isbn) === String(selectedBook.isbn);
                                  return !(sameId || sameIsbn);
                                }));
                                await removeFromLibrary(selectedBook);
                                // Reconcile with server
                                loadLibrary();
                                Alert.alert('Removed', 'The book was removed from your library.');
                                setDetailsOpen(false);
                              } catch (e: any) {
                                Alert.alert('Error', e?.message || 'Failed to remove.');
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.actionChipText}>Remove from Library</Text>
                  </TouchableOpacity>
                </View>

                {selectedBook.description ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedBook.description}</Text>
                  </View>
                ) : null}

                {/* Recommendations */}
                <View style={{ marginTop: 18 }}>
                  <Text style={styles.sectionTitle}>Recommended for you</Text>
                  {recsLoading ? (
                    <ActivityIndicator style={{ marginTop: 8 }} />
                  ) : recsError ? (
                    <Text style={styles.detailsMeta}>{recsError}</Text>
                  ) : recs.length > 0 ? (
                    <FlatList
                      data={recs}
                      keyExtractor={(b, index) => {
                        if (b?.id) return String(b.id) + '-' + index;
                        if (b?.isbn) return String(b.isbn) + '-' + index;
                        const t = b?.title || 'untitled';
                        const a = b?.author || 'unknown';
                        return `${t}-${a}-${index}`;
                      }}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingVertical: 6, gap: 12 }}
                      renderItem={({ item }) => {
                        const inLib = isInLibrary(item);
                        return (
                          <View style={styles.recItem}>
                            <TouchableOpacity onPress={() => setSelectedBook(item)}>
                              <Image source={{ uri: item.coverUrl || 'https://via.placeholder.com/120x180?text=Book' }} style={styles.recCover} />
                            </TouchableOpacity>
                            <Text style={styles.recTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.recAuthor} numberOfLines={1}>{item.author || 'Unknown'}</Text>
                            {inLib ? (
                              <TouchableOpacity
                                style={[styles.recAddBtn, { backgroundColor: '#ef4444' }]}
                                onPress={async () => {
                                  try {
                                    const libBook = findLibraryBookFor(item);
                                    if (!libBook || !(libBook.id && /^\d+$/.test(String(libBook.id)))) {
                                      throw new Error('Missing library book id to remove');
                                    }
                                    await removeFromLibrary(libBook);
                                    setBooks(curr => curr.filter(x => String(x.id) !== String(libBook.id)));
                                    loadLibrary();
                                    Alert.alert('Removed', 'The book was removed from your library.');
                                  } catch (e: any) {
                                    Alert.alert('Error', e?.message || 'Failed to remove.');
                                  }
                                }}
                              >
                                <Text style={styles.recAddBtnText}>Remove</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.recAddBtn}
                                onPress={async () => {
                                  try {
                                    const added = await addToLibraryByPayload(item, item.genre);
                                    // Update this rec item with the new backend id so isInLibrary(id) becomes true
                                    if (added && added.id != null) {
                                      setRecs(curr => curr.map(r => {
                                        const sameId = r.id != null && item.id != null && String(r.id) === String(item.id);
                                        const sameIsbn = r.isbn && item.isbn && String(r.isbn) === String(item.isbn);
                                        const sameTitleAuthor = (r.title === item.title) && ((r.author || '') === (item.author || ''));
                                        if (sameId || sameIsbn || sameTitleAuthor) {
                                          return { ...r, id: String(added.id) } as any;
                                        }
                                        return r;
                                      }));
                                      // Optimistically add to local books so the button toggles immediately
                                      setBooks(curr => {
                                        const exists = curr.some(b => String(b.id) === String(added.id));
                                        if (exists) return curr;
                                        const newBook = {
                                          id: String(added.id),
                                          title: added.title || item.title || 'Untitled',
                                          author: added.author || item.author || 'Unknown',
                                          genre: added.genreShelf || added.genre || item.genre || 'General',
                                          coverUrl: (added.coverImageUrl || added.coverUrl || item.coverUrl || '').replace(/^http:\/\//, 'https://'),
                                          isbn: added.isbn || item.isbn,
                                          description: added.description || item.description,
                                          publisher: added.publisher || item.publisher,
                                          publicationYear: added.publicationYear || item.publicationYear,
                                          pageCount: added.pageCount || item.pageCount,
                                          genreShelf: added.genreShelf,
                                          ageShelf: added.ageShelf,
                                        } as any;
                                        return [...curr, newBook];
                                      });
                                    }
                                    Alert.alert('Added', 'The book was added to your library.');
                                    // Refresh library to include the new item
                                    loadLibrary();
                                  } catch (e: any) {
                                    Alert.alert('Error', e?.message || 'Failed to add.');
                                  }
                                }}
                              >
                                <Text style={styles.recAddBtnText}>Add</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      }}
                      />
                  ) : (
                    <Text style={styles.detailsMeta}>No recommendations yet.</Text>
                  )}
                </View>
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
  // Actions row under the top details
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  actionChip: {
    backgroundColor: '#f0f0f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  actionChipText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 12,
  },
  recItem: {
    width: 120,
  },
  recCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  recTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  recAuthor: {
    fontSize: 11,
    color: '#666',
  },
  recAddBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recAddBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
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
