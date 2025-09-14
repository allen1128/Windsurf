import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from 'react-native';
import {launchImageLibrary, launchCamera, ImagePickerResponse} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {apiService, Book} from '../services/apiService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ScanScreen = ({navigation}: any) => {
  const [scanning, setScanning] = useState(false);
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const requestCameraPermission = async () => {
    const result = await request(PERMISSIONS.IOS.CAMERA);
    return result === RESULTS.GRANTED;
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to scan the book',
      [
        {text: 'Camera', onPress: () => openCamera()},
        {text: 'Photo Library', onPress: () => openImageLibrary()},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to scan books');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      handleImageResponse
    );
  };

  const openImageLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      handleImageResponse
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0] && response.assets[0].base64) {
      scanBook(response.assets[0].base64);
    }
  };

  const scanBook = async (base64Image: string) => {
    setScanning(true);
    
    try {
      // Try barcode scan first
      const barcodeResult = await apiService.scanBook({
        imageBase64: base64Image,
        scanType: 'barcode',
      });
      
      if (barcodeResult) {
        handleScanResult(barcodeResult);
        return;
      }
    } catch (error) {
      // If barcode scan fails, try cover scan
      try {
        const coverResult = await apiService.scanBook({
          imageBase64: base64Image,
          scanType: 'cover',
        });
        
        if (coverResult) {
          handleScanResult(coverResult);
          return;
        }
      } catch (coverError) {
        Alert.alert('Scan Failed', 'Could not identify the book. Please try again with a clearer image.');
      }
    } finally {
      setScanning(false);
    }
  };

  const handleScanResult = async (book: Book) => {
    // Check for duplicates
    if (book.isbn) {
      try {
        const duplicateCheck = await apiService.checkDuplicate(book.isbn);
        if (duplicateCheck.isDuplicate) {
          Alert.alert(
            'Book Already in Library',
            `"${book.title}" is already in your library!`,
            [{text: 'OK'}]
          );
          return;
        }
      } catch (error) {
        console.warn('Duplicate check failed:', error);
      }
    }

    setScannedBook(book);
    setShowBookModal(true);
  };

  const addToLibrary = async (genreShelf?: string, ageShelf?: string) => {
    if (!scannedBook) return;

    try {
      await apiService.addBookToLibrary(scannedBook.id, genreShelf, ageShelf);
      Alert.alert(
        'Success!',
        `"${scannedBook.title}" has been added to your library.`,
        [
          {
            text: 'View Library',
            onPress: () => {
              setShowBookModal(false);
              setScannedBook(null);
              navigation.navigate('Library');
            },
          },
          {
            text: 'Scan Another',
            onPress: () => {
              setShowBookModal(false);
              setScannedBook(null);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add book to library');
    }
  };

  const renderBookModal = () => {
    if (!scannedBook) return null;

    return (
      <Modal
        visible={showBookModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Found!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowBookModal(false);
                setScannedBook(null);
              }}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.bookDetails}>
            {scannedBook.coverImageUrl && (
              <Image
                source={{uri: scannedBook.coverImageUrl}}
                style={styles.bookCover}
                resizeMode="contain"
              />
            )}
            
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{scannedBook.title}</Text>
              <Text style={styles.bookAuthor}>by {scannedBook.author}</Text>
              
              {scannedBook.description && (
                <Text style={styles.bookDescription} numberOfLines={4}>
                  {scannedBook.description}
                </Text>
              )}
              
              <View style={styles.bookMeta}>
                {scannedBook.genre && (
                  <Text style={styles.metaText}>Genre: {scannedBook.genre}</Text>
                )}
                {scannedBook.publicationYear && (
                  <Text style={styles.metaText}>Published: {scannedBook.publicationYear}</Text>
                )}
                {scannedBook.pageCount && (
                  <Text style={styles.metaText}>Pages: {scannedBook.pageCount}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToLibrary(scannedBook.genre)}>
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add to Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                setShowBookModal(false);
                navigation.navigate('BookDetails', {book: scannedBook});
              }}>
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="camera-alt" size={80} color="#6B4E71" />
        <Text style={styles.title}>Scan a Book</Text>
        <Text style={styles.subtitle}>
          Take a photo of the book cover or barcode to add it to your library
        </Text>
      </View>

      <View style={styles.scanArea}>
        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
          onPress={handleImagePicker}
          disabled={scanning}>
          <Icon 
            name={scanning ? "hourglass-empty" : "camera-alt"} 
            size={40} 
            color="#fff" 
          />
          <Text style={styles.scanButtonText}>
            {scanning ? 'Scanning...' : 'Scan Book'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Scanning Tips:</Text>
        <Text style={styles.tipText}>• Ensure good lighting</Text>
        <Text style={styles.tipText}>• Keep the book cover or barcode in focus</Text>
        <Text style={styles.tipText}>• Avoid shadows and glare</Text>
        <Text style={styles.tipText}>• Hold the camera steady</Text>
      </View>

      {renderBookModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4E71',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#6B4E71',
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tips: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  bookDetails: {
    flex: 1,
    padding: 20,
  },
  bookCover: {
    width: 120,
    height: 180,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  bookInfo: {
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  bookDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  bookMeta: {
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 3,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#6B4E71',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: '#6B4E71',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#6B4E71',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanScreen;
