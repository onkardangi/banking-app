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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountNumberGenerator accountNumberGenerator;

    @InjectMocks
    private AccountService accountService;

    private User testUser;
    private Account testAccount;
    private CreateAccountRequest createRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded-password")
                .firstName("John")
                .lastName("Doe")
                .role(User.Role.CUSTOMER)
                .enabled(true)
                .build();

        testAccount = Account.builder()
                .id(1L)
                .accountNumber("1234567890123456")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .status(Account.AccountStatus.ACTIVE)
                .user(testUser)
                .userId(1L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createRequest = CreateAccountRequest.builder()
                .accountType(Account.AccountType.SAVINGS)
                .initialDeposit(new BigDecimal("500.00"))
                .build();
    }

    @Test
    void createAccount_success() {
        // Arrange
        when(accountRepository.countByUserId(1L)).thenReturn(0L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(accountNumberGenerator.generate()).thenReturn("1234567890123456");
        when(accountRepository.existsByAccountNumber("1234567890123456")).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        AccountResponse response = accountService.createAccount(createRequest, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccountNumber()).isEqualTo("1234567890123456");
        assertThat(response.getAccountType()).isEqualTo(Account.AccountType.SAVINGS);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void createAccount_limitExceeded() {
        // Arrange
        when(accountRepository.countByUserId(1L)).thenReturn(5L);

        // Act & Assert
        assertThatThrownBy(() -> accountService.createAccount(createRequest, 1L))
                .isInstanceOf(AccountLimitExceededException.class)
                .hasMessageContaining("Maximum account limit reached");

        verify(accountRepository, never()).save(any());
    }

    @Test
    void createAccount_userNotFound() {
        // Arrange
        when(accountRepository.countByUserId(1L)).thenReturn(0L);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> accountService.createAccount(createRequest, 1L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getUserAccounts_returnsList() {
        // Arrange
        Account secondAccount = Account.builder()
                .id(2L)
                .accountNumber("1234999999999999")
                .accountType(Account.AccountType.CHECKING)
                .balance(BigDecimal.ZERO)
                .status(Account.AccountStatus.ACTIVE)
                .user(testUser)
                .userId(1L)
                .build();

        when(accountRepository.findByUserId(1L)).thenReturn(List.of(testAccount, secondAccount));

        // Act
        List<AccountSummary> accounts = accountService.getUserAccounts(1L);

        // Assert
        assertThat(accounts).hasSize(2);
        assertThat(accounts.get(0).getAccountType()).isEqualTo(Account.AccountType.SAVINGS);
        assertThat(accounts.get(1).getAccountType()).isEqualTo(Account.AccountType.CHECKING);
    }

    @Test
    void getAccountById_success() {
        // Arrange
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));

        // Act
        AccountResponse response = accountService.getAccountById(1L, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    @Test
    void getAccountById_notFound() {
        // Arrange
        when(accountRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> accountService.getAccountById(99L, 1L))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessageContaining("Account not found");
    }

    @Test
    void getAccountByNumber_success() {
        // Arrange
        when(accountRepository.findByAccountNumber("1234567890123456")).thenReturn(Optional.of(testAccount));

        // Act
        AccountResponse response = accountService.getAccountByNumber("1234567890123456", 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccountNumber()).isEqualTo("1234567890123456");
    }

    @Test
    void getAccountByNumber_unauthorizedAccess() {
        // Arrange
        when(accountRepository.findByAccountNumber("1234567890123456")).thenReturn(Optional.of(testAccount));

        // Act & Assert — userId 99 doesn't own this account
        assertThatThrownBy(() -> accountService.getAccountByNumber("1234567890123456", 99L))
                .isInstanceOf(UnauthorizedAccessException.class)
                .hasMessageContaining("don't have access");
    }

    @Test
    void deleteAccount_success() {
        // Arrange — account with zero balance
        Account zeroBalanceAccount = Account.builder()
                .id(1L)
                .accountNumber("1234567890123456")
                .accountType(Account.AccountType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .status(Account.AccountStatus.ACTIVE)
                .user(testUser)
                .userId(1L)
                .build();

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(zeroBalanceAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(zeroBalanceAccount);

        // Act
        accountService.deleteAccount(1L, 1L);

        // Assert — soft delete sets status to INACTIVE
        verify(accountRepository).save(argThat(account ->
                account.getStatus() == Account.AccountStatus.INACTIVE
        ));
    }

    @Test
    void deleteAccount_nonZeroBalance() {
        // Arrange — testAccount has balance 1000.00
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        assertThatThrownBy(() -> accountService.deleteAccount(1L, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("non-zero balance");

        verify(accountRepository, never()).save(any());
    }

    @Test
    void updateAccountStatus_success() {
        // Arrange
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        AccountResponse response = accountService.updateAccountStatus(1L, 1L, Account.AccountStatus.FROZEN);

        // Assert
        verify(accountRepository).save(argThat(account ->
                account.getStatus() == Account.AccountStatus.FROZEN
        ));
    }
}
