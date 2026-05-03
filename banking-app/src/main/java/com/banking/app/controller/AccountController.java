package com.banking.app.controller;

import com.banking.app.dto.AccountResponse;
import com.banking.app.dto.AccountSummary;
import com.banking.app.dto.CreateAccountRequest;
import com.banking.app.entity.Account;
import com.banking.app.service.AccountService;
import com.banking.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:36
 */

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest request,
                                                         Authentication authentication) {
        Long userId = authService.getCurrentUserId(authentication);
        AccountResponse response = accountService.createAccount(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AccountSummary>> getAllAccounts(Authentication authentication) {
        Long userId = authService.getCurrentUserId(authentication);
        List<AccountSummary> accounts = accountService.getUserAccounts(userId);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccountById(
            @PathVariable Long accountId,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        AccountResponse response = accountService.getAccountById(accountId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccountByNumber(
            @PathVariable String accountNumber,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        AccountResponse response = accountService.getAccountByNumber(accountNumber, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long accountId,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        accountService.deleteAccount(accountId, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{accountId}/status")
    public ResponseEntity<AccountResponse> updateAccountStatus(
            @PathVariable Long accountId,
            @RequestParam Account.AccountStatus status,
            Authentication authentication) {

        Long userId = authService.getCurrentUserId(authentication);
        AccountResponse response = accountService.updateAccountStatus(accountId, userId, status);
        return ResponseEntity.ok(response);
    }
}
