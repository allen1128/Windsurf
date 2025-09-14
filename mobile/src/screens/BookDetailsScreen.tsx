import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {apiService, Book, AIRecommendation} from '../services/apiService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BookDetailsScreen = ({route, navigation}: any) => {
  const {book}: {book: Book} = route.params;
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      const recommendation = await apiService.getBookRecommendations(book.id);
      setAiRecommendation(recommendation);
    } catch (error) {
      console.warn('Failed to load AI recommendations:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const renderAgeRecommendation = () => {
    if (loadingAI) {
      return (
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>AI Age Recommendation</Text>
          <Text style={styles.loadingText}>Getting AI recommendations...</Text>
        </View>
      );
    }

    if (!aiRecommendation) {
      return null;
    }

    return (
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>
          <Icon name="psychology" size={20} color="#6B4E71" /> AI Age Recommendation
        </Text>
        
        <View style={styles.ageRecommendation}>
          <Text style={styles.ageText}>{aiRecommendation.ageRecommendation}</Text>
          <Text style={styles.readingLevel}>Reading Level: {aiRecommendation.readingLevel}</Text>
        </View>

        <Text style={styles.reasoningTitle}>Why this age range?</Text>
        <Text style={styles.reasoningText}>{aiRecommendation.reasoning}</Text>

        {aiRecommendation.themes && aiRecommendation.themes.length > 0 && (
          <View style={styles.themesContainer}>
            <Text style={styles.themesTitle}>Themes:</Text>
            <View style={styles.themesList}>
              {aiRecommendation.themes.map((theme, index) => (
                <View key={index} style={styles.themeTag}>
                  <Text style={styles.themeText}>{theme}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderBookInfo = () => {
    return (
      <View style={styles.bookInfoSection}>
        <View style={styles.bookHeader}>
          {book.coverImageUrl ? (
            <Image
              source={{uri: book.coverImageUrl}}
              style={styles.bookCover}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderCover}>
              <Icon name="book" size={60} color="#ccc" />
            </View>
          )}
          
          <View style={styles.bookTitleSection}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
            
            {book.isFavorite && (
              <View style={styles.favoriteIndicator}>
                <Icon name="favorite" size={16} color="#FF6B6B" />
                <Text style={styles.favoriteText}>Favorite</Text>
              </View>
            )}
          </View>
        </View>

        {book.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        )}

        <View style={styles.metadataSection}>
          <Text style={styles.sectionTitle}>Book Details</Text>
          
          <View style={styles.metadataGrid}>
            {book.genre && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Genre:</Text>
                <Text style={styles.metadataValue}>{book.genre}</Text>
              </View>
            )}
            
            {book.publisher && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Publisher:</Text>
                <Text style={styles.metadataValue}>{book.publisher}</Text>
              </View>
            )}
            
            {book.publicationYear && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Published:</Text>
                <Text style={styles.metadataValue}>{book.publicationYear}</Text>
              </View>
            )}
            
            {book.pageCount && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Pages:</Text>
                <Text style={styles.metadataValue}>{book.pageCount}</Text>
              </View>
            )}
            
            {book.isbn && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>ISBN:</Text>
                <Text style={styles.metadataValue}>{book.isbn}</Text>
              </View>
            )}
            
            {book.ageRangeMin && book.ageRangeMax && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Age Range:</Text>
                <Text style={styles.metadataValue}>
                  {book.ageRangeMin}-{book.ageRangeMax} years
                </Text>
              </View>
            )}
          </View>
        </View>

        {book.personalNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Personal Notes</Text>
            <Text style={styles.personalNotes}>{book.personalNotes}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderBookInfo()}
      {renderAgeRecommendation()}
      
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Edit book details will be available in a future update.')}>
          <Icon name="edit" size={20} color="#6B4E71" />
          <Text style={styles.actionButtonText}>Edit Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Share book will be available in a future update.')}>
          <Icon name="share" size={20} color="#6B4E71" />
          <Text style={styles.actionButtonText}>Share Book</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  bookInfoSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholderCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bookTitleSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  favoriteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  favoriteText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 4,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  metadataSection: {
    marginBottom: 20,
  },
  metadataGrid: {
    flexDirection: 'column',
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  metadataValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  notesSection: {
    marginBottom: 10,
  },
  personalNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  aiSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  ageRecommendation: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  ageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B4E71',
    marginBottom: 5,
  },
  readingLevel: {
    fontSize: 14,
    color: '#666',
  },
  reasoningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  reasoningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  themesContainer: {
    marginTop: 10,
  },
  themesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  themesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeTag: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  themeText: {
    fontSize: 12,
    color: '#6B4E71',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B4E71',
  },
  actionButtonText: {
    color: '#6B4E71',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default BookDetailsScreen;
