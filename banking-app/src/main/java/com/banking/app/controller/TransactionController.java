package com.banking.app.controller;

import com.banking.app.dto.*;
import com.banking.app.service.AuthService;
import com.banking.app.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author onkardangi
 * @date 5/3/26
 * @time 11:08
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final AuthService authService;
    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(
            @Valid @RequestBody DepositRequest request,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        TransactionResponse response = transactionService.deposit(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(
            @Valid @RequestBody WithdrawalRequest request,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        TransactionResponse response = transactionService.withdraw(request, userId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getAccountTransactions(
            @PathVariable Long accountId,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        List<TransactionResponse> transactions = transactionService.getAccountTransactions(accountId, userId);

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long transactionId,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        TransactionResponse transaction = transactionService.getTransactionById(transactionId, userId);

        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/account/{accountId}/paginated")
    public ResponseEntity<Page<TransactionResponse>> getAccountTransactionsPaginated(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        Page<TransactionResponse> transactions = transactionService.getAccountTransactionsPaginated(accountId, userId, page, size);

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/all")
    public ResponseEntity<Page<TransactionResponse>> getAllUserTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        Page<TransactionResponse> transactions = transactionService.getAllUserTransactions(userId, page, size);

        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(@Valid @RequestBody TransferRequest request,
                                                     Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        TransferResponse response = transactionService.transfer(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);

    }
}
