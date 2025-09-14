package com.littlelibrary.repository;

import com.littlelibrary.model.Library;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LibraryRepository extends JpaRepository<Library, Long> {
    List<Library> findByUserId(Long userId);
    List<Library> findByUserIdAndIsShared(Long userId, Boolean isShared);
}
