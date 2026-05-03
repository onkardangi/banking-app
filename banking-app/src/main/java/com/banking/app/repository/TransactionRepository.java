package com.banking.app.repository;

import com.banking.app.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 22:18
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Get all transactions for an account, newest first
    List<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    // Get transactions by type
    List<Transaction> findByAccountIdAndTypeOrderByCreatedAtDesc(Long accountId, Transaction.TransactionType type);

    // Get the most recent transaction for an account
    // Useful for getting last balance
    Optional<Transaction> findTopByAccountIdOrderByCreatedAtDesc(Long accountId);

    // Get paginated transactions for an account
    Page<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    // Get recent transactions across all user's accounts (for dashboard)
    Page<Transaction> findByAccount_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

}
