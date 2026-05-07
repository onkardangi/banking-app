package com.banking.app.service;

import com.banking.app.dto.*;
import com.banking.app.entity.Account;
import com.banking.app.entity.Transaction;
import com.banking.app.entity.User;
import com.banking.app.exception.AccountNotFoundException;
import com.banking.app.exception.InsufficientFundsException;
import com.banking.app.exception.SameAccountTransferException;
import com.banking.app.repository.AccountRepository;
import com.banking.app.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Account activeAccount;
    private Account secondActiveAccount;
    private Account inactiveAccount;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        activeAccount = Account.builder()
                .id(1L)
                .accountNumber("1234567890123456")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .status(Account.AccountStatus.ACTIVE)
                .user(testUser)
                .userId(1L)
                .build();

        secondActiveAccount = Account.builder()
                .id(3L)
                .accountNumber("9876543210123456")
                .accountType(Account.AccountType.CHECKING)
                .balance(new BigDecimal("2000.00"))
                .status(Account.AccountStatus.ACTIVE)
                .user(testUser)
                .userId(1L)
                .build();

        inactiveAccount = Account.builder()
                .id(2L)
                .accountNumber("1234999999999999")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("500.00"))
                .status(Account.AccountStatus.INACTIVE)
                .user(testUser)
                .userId(1L)
                .build();
    }

    @Test
    void deposit_success() {
        // Arrange
        DepositRequest request = DepositRequest.builder()
                .accountId(1L)
                .amount(new BigDecimal("200.00"))
                .description("Test deposit")
                .build();

        Transaction savedTransaction = Transaction.builder()
                .id(1L)
                .accountId(1L)
                .type(Transaction.TransactionType.DEPOSIT)
                .amount(new BigDecimal("200.00"))
                .description("Test deposit")
                .balanceAfter(new BigDecimal("1200.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(activeAccount);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        // Act
        TransactionResponse response = transactionService.deposit(request, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getType()).isEqualTo(Transaction.TransactionType.DEPOSIT);
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("200.00"));
        assertThat(response.getBalanceAfter()).isEqualByComparingTo(new BigDecimal("1200.00"));

        // Verify balance was updated
        verify(accountRepository).save(argThat(account ->
                account.getBalance().compareTo(new BigDecimal("1200.00")) == 0
        ));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void deposit_inactiveAccount() {
        // Arrange
        DepositRequest request = DepositRequest.builder()
                .accountId(2L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(inactiveAccount));

        // Act & Assert
        assertThatThrownBy(() -> transactionService.deposit(request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot deposit");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void deposit_accountNotFound() {
        // Arrange
        DepositRequest request = DepositRequest.builder()
                .accountId(99L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> transactionService.deposit(request, 1L))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    void withdraw_success() {
        // Arrange
        WithdrawalRequest request = WithdrawalRequest.builder()
                .accountId(1L)
                .amount(new BigDecimal("300.00"))
                .description("Test withdrawal")
                .build();

        Transaction savedTransaction = Transaction.builder()
                .id(2L)
                .accountId(1L)
                .type(Transaction.TransactionType.WITHDRAWAL)
                .amount(new BigDecimal("300.00"))
                .description("Test withdrawal")
                .balanceAfter(new BigDecimal("700.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(activeAccount);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        // Act
        TransactionResponse response = transactionService.withdraw(request, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getType()).isEqualTo(Transaction.TransactionType.WITHDRAWAL);
        assertThat(response.getBalanceAfter()).isEqualByComparingTo(new BigDecimal("700.00"));

        verify(accountRepository).save(argThat(account ->
                account.getBalance().compareTo(new BigDecimal("700.00")) == 0
        ));
    }

    @Test
    void withdraw_insufficientFunds() {
        // Arrange
        WithdrawalRequest request = WithdrawalRequest.builder()
                .accountId(1L)
                .amount(new BigDecimal("5000.00"))
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));

        // Act & Assert
        assertThatThrownBy(() -> transactionService.withdraw(request, 1L))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessageContaining("Insufficient funds");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void withdraw_inactiveAccount() {
        // Arrange
        WithdrawalRequest request = WithdrawalRequest.builder()
                .accountId(2L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(inactiveAccount));

        // Act & Assert
        assertThatThrownBy(() -> transactionService.withdraw(request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot withdraw");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void getAccountTransactions_success() {
        // Arrange
        Transaction tx1 = Transaction.builder()
                .id(1L)
                .accountId(1L)
                .type(Transaction.TransactionType.DEPOSIT)
                .amount(new BigDecimal("500.00"))
                .balanceAfter(new BigDecimal("500.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        Transaction tx2 = Transaction.builder()
                .id(2L)
                .accountId(1L)
                .type(Transaction.TransactionType.WITHDRAWAL)
                .amount(new BigDecimal("100.00"))
                .balanceAfter(new BigDecimal("400.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(transactionRepository.findByAccountIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(tx2, tx1));

        // Act
        List<TransactionResponse> transactions = transactionService.getAccountTransactions(1L, 1L);

        // Assert
        assertThat(transactions).hasSize(2);
        assertThat(transactions.get(0).getType()).isEqualTo(Transaction.TransactionType.WITHDRAWAL);
        assertThat(transactions.get(1).getType()).isEqualTo(Transaction.TransactionType.DEPOSIT);
    }

    @Test
    void getAccountTransactions_accountNotFound() {
        // Arrange
        when(accountRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> transactionService.getAccountTransactions(99L, 1L))
                .isInstanceOf(AccountNotFoundException.class);
    }

    // --- Transfer Tests ---

    @Test
    void transfer_success() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(1L)
                .toAccountId(3L)
                .amount(new BigDecimal("250.00"))
                .description("Rent money")
                .build();

        Transaction withdrawalTx = Transaction.builder()
                .id(10L)
                .accountId(1L)
                .account(activeAccount)
                .type(Transaction.TransactionType.TRANSFER)
                .amount(new BigDecimal("250.00"))
                .description("Rent money (Transfer to CHECKING)")
                .balanceAfter(new BigDecimal("750.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        Transaction depositTx = Transaction.builder()
                .id(11L)
                .accountId(3L)
                .account(secondActiveAccount)
                .type(Transaction.TransactionType.TRANSFER)
                .amount(new BigDecimal("250.00"))
                .description("Rent money (Transfer from SAVINGS)")
                .balanceAfter(new BigDecimal("2250.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByIdAndUserId(3L, 1L)).thenReturn(Optional.of(secondActiveAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(withdrawalTx)
                .thenReturn(depositTx);

        // Act
        TransferResponse response = transactionService.transfer(request, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getMessage()).isEqualTo("Transfer successful");
        assertThat(response.getWithdrawal().getAmount()).isEqualByComparingTo(new BigDecimal("250.00"));
        assertThat(response.getDeposit().getAmount()).isEqualByComparingTo(new BigDecimal("250.00"));
        assertThat(response.getWithdrawal().getBalanceAfter()).isEqualByComparingTo(new BigDecimal("750.00"));
        assertThat(response.getDeposit().getBalanceAfter()).isEqualByComparingTo(new BigDecimal("2250.00"));

        // Verify both accounts were saved with updated balances
        verify(accountRepository).save(argThat(account ->
                account.getId().equals(1L) && account.getBalance().compareTo(new BigDecimal("750.00")) == 0
        ));
        verify(accountRepository).save(argThat(account ->
                account.getId().equals(3L) && account.getBalance().compareTo(new BigDecimal("2250.00")) == 0
        ));
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }

    @Test
    void transfer_sameAccount() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(1L)
                .toAccountId(1L)
                .amount(new BigDecimal("100.00"))
                .build();

        // Act & Assert
        assertThatThrownBy(() -> transactionService.transfer(request, 1L))
                .isInstanceOf(SameAccountTransferException.class)
                .hasMessageContaining("Cannot transfer to the same account");

        verify(accountRepository, never()).findByIdAndUserId(any(), any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_sourceAccountNotFound() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(99L)
                .toAccountId(3L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> transactionService.transfer(request, 1L))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessageContaining("Source account");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_destinationAccountNotFound() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(1L)
                .toAccountId(99L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> transactionService.transfer(request, 1L))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessageContaining("Destination account");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_sourceAccountInactive() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(2L)
                .toAccountId(3L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(inactiveAccount));
        when(accountRepository.findByIdAndUserId(3L, 1L)).thenReturn(Optional.of(secondActiveAccount));

        // Act & Assert
        assertThatThrownBy(() -> transactionService.transfer(request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Source account is not active");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_destinationAccountInactive() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(1L)
                .toAccountId(2L)
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(inactiveAccount));

        // Act & Assert
        assertThatThrownBy(() -> transactionService.transfer(request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Destination account is not active");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_insufficientFunds() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(1L)
                .toAccountId(3L)
                .amount(new BigDecimal("5000.00"))
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByIdAndUserId(3L, 1L)).thenReturn(Optional.of(secondActiveAccount));

        // Act & Assert
        assertThatThrownBy(() -> transactionService.transfer(request, 1L))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessageContaining("Insufficient funds");

        verify(accountRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_withoutDescription() {
        // Arrange
        TransferRequest request = TransferRequest.builder()
                .fromAccountId(1L)
                .toAccountId(3L)
                .amount(new BigDecimal("100.00"))
                .build();

        Transaction withdrawalTx = Transaction.builder()
                .id(12L)
                .accountId(1L)
                .account(activeAccount)
                .type(Transaction.TransactionType.TRANSFER)
                .amount(new BigDecimal("100.00"))
                .description("Transfer to CHECKING")
                .balanceAfter(new BigDecimal("900.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        Transaction depositTx = Transaction.builder()
                .id(13L)
                .accountId(3L)
                .account(secondActiveAccount)
                .type(Transaction.TransactionType.TRANSFER)
                .amount(new BigDecimal("100.00"))
                .description("Transfer from SAVINGS")
                .balanceAfter(new BigDecimal("2100.00"))
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activeAccount));
        when(accountRepository.findByIdAndUserId(3L, 1L)).thenReturn(Optional.of(secondActiveAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(withdrawalTx)
                .thenReturn(depositTx);

        // Act
        TransferResponse response = transactionService.transfer(request, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getWithdrawal().getDescription()).isEqualTo("Transfer to CHECKING");
        assertThat(response.getDeposit().getDescription()).isEqualTo("Transfer from SAVINGS");
    }
}
