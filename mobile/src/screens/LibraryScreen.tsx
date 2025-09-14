import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {apiService, Book} from '../services/apiService';
import BookshelfView from '../components/BookshelfView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LibraryScreen = ({navigation}: any) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'bookshelf' | 'list'>('bookshelf');
  const [filterMode, setFilterMode] = useState<'all' | 'genre' | 'age'>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const {user} = useAuth();

  useEffect(() => {
    loadBooks();
  }, [selectedFilter]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const filter = selectedFilter ? `${filterMode}:${selectedFilter}` : undefined;
      const booksData = await apiService.getLibraryBooks(filter);
      setBooks(booksData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBooks();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await apiService.searchBooks(searchQuery);
      setBooks(searchResults);
    } catch (error) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: Book) => {
    navigation.navigate('BookDetails', {book});
  };

  const getGenres = () => {
    const genres = [...new Set(books.map(book => book.genreShelf).filter(Boolean))];
    return genres;
  };

  const getAgeRanges = () => {
    const ages = [...new Set(books.map(book => book.ageShelf).filter(Boolean))];
    return ages.sort();
  };

  const renderFilterButtons = () => {
    if (filterMode === 'genre') {
      return (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedFilter && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('')}>
            <Text style={[styles.filterText, !selectedFilter && styles.filterTextActive]}>
              All Genres
            </Text>
          </TouchableOpacity>
          {getGenres().map(genre => (
            <TouchableOpacity
              key={genre}
              style={[styles.filterButton, selectedFilter === genre && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(selectedFilter === genre ? '' : genre)}>
              <Text style={[styles.filterText, selectedFilter === genre && styles.filterTextActive]}>
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (filterMode === 'age') {
      return (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedFilter && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('')}>
            <Text style={[styles.filterText, !selectedFilter && styles.filterTextActive]}>
              All Ages
            </Text>
          </TouchableOpacity>
          {getAgeRanges().map(age => (
            <TouchableOpacity
              key={age}
              style={[styles.filterButton, selectedFilter === age && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(selectedFilter === age ? '' : age)}>
              <Text style={[styles.filterText, selectedFilter === age && styles.filterTextActive]}>
                {age}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.firstName}!</Text>
        <Text style={styles.libraryCount}>{books.length} books in your library</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your library..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#6B4E71" />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'bookshelf' && styles.toggleButtonActive]}
          onPress={() => setViewMode('bookshelf')}>
          <Icon name="view-module" size={20} color={viewMode === 'bookshelf' ? '#fff' : '#6B4E71'} />
          <Text style={[styles.toggleText, viewMode === 'bookshelf' && styles.toggleTextActive]}>
            Bookshelf
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}>
          <Icon name="view-list" size={20} color={viewMode === 'list' ? '#fff' : '#6B4E71'} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.filterModeButton, filterMode === 'all' && styles.filterModeButtonActive]}
          onPress={() => {setFilterMode('all'); setSelectedFilter('');}}>
          <Text style={[styles.filterModeText, filterMode === 'all' && styles.filterModeTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterModeButton, filterMode === 'genre' && styles.filterModeButtonActive]}
          onPress={() => {setFilterMode('genre'); setSelectedFilter('');}}>
          <Text style={[styles.filterModeText, filterMode === 'genre' && styles.filterModeTextActive]}>
            By Genre
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterModeButton, filterMode === 'age' && styles.filterModeButtonActive]}
          onPress={() => {setFilterMode('age'); setSelectedFilter('');}}>
          <Text style={[styles.filterModeText, filterMode === 'age' && styles.filterModeTextActive]}>
            By Age
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      {renderFilterButtons()}

      {/* Books Display */}
      {viewMode === 'bookshelf' ? (
        <BookshelfView
          books={books}
          onBookPress={handleBookPress}
          loading={loading}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={books}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleBookPress(item)}>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
                <Text style={styles.bookGenre}>{item.genreShelf || item.genre}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  libraryCount: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchButton: {
    padding: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#6B4E71',
  },
  toggleButtonActive: {
    backgroundColor: '#6B4E71',
  },
  toggleText: {
    marginLeft: 5,
    color: '#6B4E71',
  },
  toggleTextActive: {
    color: '#fff',
  },
  filterModeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#6B4E71',
  },
  filterModeButtonActive: {
    backgroundColor: '#6B4E71',
  },
  filterModeText: {
    color: '#6B4E71',
    fontSize: 14,
  },
  filterModeTextActive: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  filterButtonActive: {
    backgroundColor: '#6B4E71',
    borderColor: '#6B4E71',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 1,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookGenre: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default LibraryScreen;
