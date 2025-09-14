import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Book} from '../services/apiService';

interface BookshelfViewProps {
  books: Book[];
  onBookPress: (book: Book) => void;
  loading: boolean;
  refreshControl?: React.ReactElement;
}

const {width: screenWidth} = Dimensions.get('window');
const BOOK_WIDTH = 80;
const BOOK_HEIGHT = 120;
const BOOKS_PER_SHELF = Math.floor((screenWidth - 40) / (BOOK_WIDTH + 10));

const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  onBookPress,
  loading,
  refreshControl,
}) => {
  const renderBook = (book: Book, index: number) => {
    const colors = [
      ['#FF6B6B', '#FF8E8E'],
      ['#4ECDC4', '#44A08D'],
      ['#45B7D1', '#96C93D'],
      ['#FFA07A', '#FA8072'],
      ['#98D8C8', '#F7DC6F'],
      ['#BB8FCE', '#85C1E9'],
    ];
    
    const colorIndex = index % colors.length;
    const bookColors = colors[colorIndex];

    return (
      <TouchableOpacity
        key={book.id}
        style={styles.bookContainer}
        onPress={() => onBookPress(book)}>
        <LinearGradient
          colors={bookColors}
          style={styles.book}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          {book.coverImageUrl ? (
            <Image
              source={{uri: book.coverImageUrl}}
              style={styles.bookCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bookContent}>
              <Text style={styles.bookTitle} numberOfLines={3}>
                {book.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={2}>
                {book.author}
              </Text>
            </View>
          )}
        </LinearGradient>
        <View style={styles.bookSpine} />
      </TouchableOpacity>
    );
  };

  const renderShelf = (shelfBooks: Book[], shelfIndex: number) => {
    return (
      <View key={shelfIndex} style={styles.shelfContainer}>
        <View style={styles.shelf}>
          {shelfBooks.map((book, index) => renderBook(book, shelfIndex * BOOKS_PER_SHELF + index))}
        </View>
        <View style={styles.shelfBoard} />
        <View style={styles.shelfShadow} />
      </View>
    );
  };

  const renderShelves = () => {
    const shelves = [];
    for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
      const shelfBooks = books.slice(i, i + BOOKS_PER_SHELF);
      shelves.push(renderShelf(shelfBooks, Math.floor(i / BOOKS_PER_SHELF)));
    }
    return shelves;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your library...</Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your library is empty</Text>
        <Text style={styles.emptySubtitle}>
          Start by scanning your first book!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#F8F4E6', '#E8DCC0']}
        style={styles.background}>
        <View style={styles.bookshelfContainer}>
          {renderShelves()}
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    minHeight: '100%',
    paddingVertical: 20,
  },
  bookshelfContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  shelfContainer: {
    marginBottom: 30,
  },
  shelf: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    minHeight: BOOK_HEIGHT + 20,
  },
  shelfBoard: {
    height: 8,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shelfShadow: {
    height: 4,
    backgroundColor: '#654321',
    borderRadius: 2,
    marginTop: 1,
    opacity: 0.6,
  },
  bookContainer: {
    marginRight: 5,
    alignItems: 'center',
  },
  book: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  bookContent: {
    padding: 8,
    justifyContent: 'space-between',
    height: '100%',
  },
  bookTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  bookAuthor: {
    fontSize: 8,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  bookSpine: {
    width: BOOK_WIDTH - 4,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 1,
    marginTop: 2,
  },
});

export default BookshelfView;
