package com.banking.app.dto;

import com.banking.app.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 22:26
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;
    private Long accountId;
    private Transaction.TransactionType type;
    private BigDecimal amount;
    private String description;
    private BigDecimal balanceAfter;
    private Transaction.TransactionStatus status;
    private LocalDateTime createdAt;

    public static TransactionResponse fromTransaction(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .accountId(transaction.getAccountId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .balanceAfter(transaction.getBalanceAfter())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
