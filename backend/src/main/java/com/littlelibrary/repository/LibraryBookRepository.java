package com.littlelibrary.repository;

import com.littlelibrary.model.LibraryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryBookRepository extends JpaRepository<LibraryBook, Long> {
    List<LibraryBook> findByLibraryId(Long libraryId);
    List<LibraryBook> findByLibraryIdAndGenreShelf(Long libraryId, String genreShelf);
    List<LibraryBook> findByLibraryIdAndAgeShelf(Long libraryId, String ageShelf);
    List<LibraryBook> findByLibraryIdAndIsFavorite(Long libraryId, Boolean isFavorite);
    Optional<LibraryBook> findByLibraryIdAndBookId(Long libraryId, Long bookId);
    
    @Query("SELECT lb FROM LibraryBook lb WHERE lb.library.id = :libraryId ORDER BY lb.shelfPosition")
    List<LibraryBook> findByLibraryIdOrderByShelfPosition(@Param("libraryId") Long libraryId);
    
    @Query("SELECT COUNT(lb) > 0 FROM LibraryBook lb WHERE lb.library.user.id = :userId AND lb.book.isbn = :isbn")
    Boolean existsByUserIdAndBookIsbn(@Param("userId") Long userId, @Param("isbn") String isbn);
}
