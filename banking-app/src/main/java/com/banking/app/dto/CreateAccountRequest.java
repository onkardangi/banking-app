package com.banking.app.dto;

import com.banking.app.entity.Account;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:08
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAccountRequest {

    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;

    private BigDecimal initialDeposit = BigDecimal.ZERO;
}
