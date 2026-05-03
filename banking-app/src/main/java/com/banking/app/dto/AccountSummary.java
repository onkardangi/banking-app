package com.banking.app.dto;

import com.banking.app.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:15
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountSummary {

    private Long id;
    private String accountNumber;
    private Account.AccountType accountType;
    private BigDecimal balance;
    private Account.AccountStatus status;

    public static AccountSummary fromAccount(Account account) {
        return AccountSummary.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }
}
