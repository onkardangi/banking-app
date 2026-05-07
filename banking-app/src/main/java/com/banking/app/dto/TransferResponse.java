package com.banking.app.dto;

import com.banking.app.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author onkardangi
 * @date 5/6/26
 * @time 14:48
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferResponse {

    private TransactionResponse withdrawal;
    private TransactionResponse deposit;
    private String message;

    public static TransferResponse fromTransactions(Transaction withdrawal, Transaction deposit) {
        return TransferResponse.builder().withdrawal(TransactionResponse.fromTransaction(withdrawal))
                .deposit(TransactionResponse.fromTransaction(deposit)).message("Transfer successful").build();
    }
}
