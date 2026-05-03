package com.banking.app.service;

import com.banking.app.dto.DepositRequest;
import com.banking.app.dto.TransactionResponse;
import com.banking.app.dto.WithdrawalRequest;
import com.banking.app.entity.Account;
import com.banking.app.entity.Transaction;
import com.banking.app.exception.AccountNotFoundException;
import com.banking.app.exception.InsufficientFundsException;
import com.banking.app.exception.TransactionNotFoundException;
import com.banking.app.exception.UnauthorizedAccessException;
import com.banking.app.repository.AccountRepository;
import com.banking.app.repository.TransactionRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 22:30
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    /**
     * @param request
     * @param userId
     * @return
     */
    @Transactional
    public TransactionResponse deposit(DepositRequest request, Long userId) {
        log.info("Processing deposit of {} for account ID: {}", request.getAmount(), request.getAccountId());

        // 1. Validate account
        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        // 2. Validate account status
        if(!account.isAccountActive()) {
            throw new IllegalStateException("Cannot deposit to " + account.getStatus() + " account");
        }

        // 3. Calculate new balance
        BigDecimal newBalance = account.getBalance().add(request.getAmount());

        // 4. Update account balance
        account.setBalance(newBalance);
        Account updatedAccount = accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .accountId(account.getId())
                .type(Transaction.TransactionType.DEPOSIT)
                .amount(request.getAmount())
                .description(request.getDescription())
                .balanceAfter(newBalance)
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        log.info("Deposit completed. New balance: {}", newBalance);

        return TransactionResponse.fromTransaction(savedTransaction);
    }

    @Transactional
    public TransactionResponse withdraw(WithdrawalRequest request, Long userId) {
        log.info("Processing withdrawal of {} from account ID: {}", request.getAmount(), request.getAccountId());

        // 1. Get and validate account
        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        // 2. Validate account status
        if (!account.isAccountActive()) {
            throw new IllegalStateException("Cannot withdraw from " + account.getStatus() + " account");
        }

        // 3. Check sufficient funds
        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException(
                    String.format("Insufficient funds. Available: $%s, Requested: $%s",
                            account.getBalance(), request.getAmount())
            );
        }

        // 4. Calculate new balance
        BigDecimal newBalance = account.getBalance().subtract(request.getAmount());

        // 5. Update account balance
        account.setBalance(newBalance);
        Account updatedAccount = accountRepository.save(account);

        // 6. Create transaction record
        Transaction transaction = Transaction.builder()
                .accountId(account.getId())
                .type(Transaction.TransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .description(request.getDescription())
                .balanceAfter(newBalance)
                .status(Transaction.TransactionStatus.COMPLETED)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        log.info("Withdrawal completed. New balance: {}", newBalance);

        return TransactionResponse.fromTransaction(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAccountTransactions(Long accountId, Long userId) {
        log.info("Fetching transactions for account ID: {}", accountId);

        // Verify account belongs to user
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        // Get all transactions
        List<Transaction> transactions = transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId);

        return transactions.stream()
                .map(TransactionResponse::fromTransaction)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        log.info("Fetching transaction ID: {}", transactionId);

        // Get transaction
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found"));

        // Get associated account and verify ownership
        Account account = accountRepository.findByIdAndUserId(transaction.getAccountId(), userId)
                .orElseThrow(() -> new UnauthorizedAccessException("You don't have access to this transaction"));

        return TransactionResponse.fromTransaction(transaction);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAccountTransactionsPaginated(Long accountId, Long userId, int page, int size) {
        log.info("Fetching transactions for account ID: {} (page: {}, size: {})", accountId, page, size);

        // Verify account belongs to user
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found or access denied"));

        // Create pageable request
        Pageable pageable = PageRequest.of(page, size);

        // Get paginated transactions
        Page<Transaction> transactionsPage = transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId, pageable);

        // Convert to response
        return transactionsPage.map(TransactionResponse::fromTransaction);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllUserTransactions(Long userId, int page, int size) {
        log.info("Fetching all transactions for user ID: {} (page: {}, size: {})", userId, page, size);

        // Create pageable request
        Pageable pageable = PageRequest.of(page, size);

        // Get paginated transactions across all user's accounts
        Page<Transaction> transactionsPage = transactionRepository.findByAccount_UserIdOrderByCreatedAtDesc(userId, pageable);

        // Convert to response
        return transactionsPage.map(TransactionResponse::fromTransaction);
    }
}
