import React from 'react';
import { View, FlatList, StyleSheet, ListRenderItemInfo, Dimensions } from 'react-native';
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
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
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
