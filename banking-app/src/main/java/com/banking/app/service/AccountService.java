package com.banking.app.service;

import com.banking.app.dto.AccountResponse;
import com.banking.app.dto.AccountSummary;
import com.banking.app.dto.CreateAccountRequest;
import com.banking.app.entity.Account;
import com.banking.app.entity.User;
import com.banking.app.exception.AccountLimitExceededException;
import com.banking.app.exception.AccountNotFoundException;
import com.banking.app.exception.UnauthorizedAccessException;
import com.banking.app.exception.UserNotFoundException;
import com.banking.app.repository.AccountRepository;
import com.banking.app.repository.UserRepository;
import com.banking.app.util.AccountNumberGenerator;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:22
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private static final int MAX_ACCOUNTS_PER_USER = 5;
    private final UserRepository userRepository;
    private final AccountNumberGenerator accountNumberGenerator;

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request, Long userId) {

        log.info("Creating new {} account for user ID: {}", request.getAccountType(), userId);

        //check account limit
        long accountCount = accountRepository.countByUserId(userId);
        if (accountCount >= MAX_ACCOUNTS_PER_USER) {
            throw new AccountLimitExceededException("Maximum account limit reached. You can only have " + MAX_ACCOUNTS_PER_USER + " accounts.");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));

        // Generate unique account number
        String accountNumber;
        do {
            accountNumber = accountNumberGenerator.generate();
        } while (accountRepository.existsByAccountNumber(accountNumber));

        // Handle null initialDeposit
        BigDecimal initialBalance = request.getInitialDeposit() != null
                ? request.getInitialDeposit()
                : BigDecimal.ZERO;

        // Create account
        Account account = Account.builder()
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .balance(request.getInitialDeposit())
                .status(Account.AccountStatus.ACTIVE)
                .user(user)
                .build();

        Account savedAccount = accountRepository.save(account);
        log.info("Account created successfully with account number: {}", accountNumber);

        return AccountResponse.fromAccount(savedAccount);
    }

    @Transactional(readOnly = true)
    public List<AccountSummary> getUserAccounts(Long userId) {
        log.info("Fetching all accounts for user ID: {}", userId);

        List<Account> accounts = accountRepository.findByUserId(userId);
        return accounts.stream()
                .map(AccountSummary::fromAccount)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long accountId, Long userId) {
        log.info("Fetching account ID: {} for user ID: {}", accountId, userId);

        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        return AccountResponse.fromAccount(account);
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountByNumber(String accountNumber, Long userId) {
        log.info("Fetching account number: {} for user ID: {}", accountNumber, userId);

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));

        // Check if account belongs to user
        if (!account.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have access to this account");
        }

        return AccountResponse.fromAccount(account);
    }

    @Transactional
    public void deleteAccount(Long accountId, Long userId) {
        log.info("Deleting account ID: {} for user ID: {}", accountId, userId);

        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        // Check if account has balance
        if (account.getBalance().compareTo(java.math.BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Cannot delete account with non-zero balance");
        }

        //instead of deleting, we soft delete it
        account.setStatus(Account.AccountStatus.INACTIVE);
        accountRepository.save(account);
        log.info("Account deleted successfully: {}", accountId);
    }

    @Transactional
    public AccountResponse updateAccountStatus(Long accountId, Long userId, Account.AccountStatus newStatus) {
        log.info("Updating account ID: {} status to: {}", accountId, newStatus);

        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        account.setStatus(newStatus);
        Account updatedAccount = accountRepository.save(account);

        log.info("Account status updated successfully");
        return AccountResponse.fromAccount(updatedAccount);
    }

}
