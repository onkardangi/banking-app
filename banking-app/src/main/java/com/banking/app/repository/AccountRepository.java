package com.banking.app.repository;

import com.banking.app.entity.Account;
import com.banking.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:16
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserId(Long userId);

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);

    Optional<Account> findByIdAndUserId(Long id, Long userId);

    List<Account> findByUserIdAndStatus(Long userId, Account.AccountStatus status);

    long countByUserId(Long userId);
}
