import React from 'react';
import { View, FlatList, StyleSheet, ListRenderItemInfo, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCard from './BookCard';
import type { Book } from '../types';

const GAP = 14;
const NUM_COLUMNS = 3;
const SCREEN_PADDING = 16;

function getItemWidth() {
  const width = Dimensions.get('window').width;
  const totalGaps = GAP * (NUM_COLUMNS - 1);
  const totalPadding = SCREEN_PADDING * 2;
  return (width - totalGaps - totalPadding) / NUM_COLUMNS;
}

export type BookshelfGridProps = {
  books: Book[];
  onPressBook?: (book: Book) => void;
};

export default function BookshelfGrid({ books, onPressBook }: BookshelfGridProps) {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: ListRenderItemInfo<Book>) => (
    <View style={[styles.item, { width: getItemWidth() }]}> 
      <BookCard book={item} onPress={onPressBook} />
    </View>
  );

  return (
    <FlatList
      data={books}
      keyExtractor={(b) => b.id}
      renderItem={renderItem}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={[
        styles.content,
        // Ensure bottom content is fully visible above home indicator & FAB
        { paddingBottom: Math.max(150, 120 + insets.bottom) },
      ]}
      contentInset={{ bottom: insets.bottom }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={true}
      ListFooterComponent={<View style={{ height: insets.bottom + 60 }} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 120,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
    alignItems: 'flex-start',
  },
  item: {
    alignItems: 'flex-start',
  },
});
