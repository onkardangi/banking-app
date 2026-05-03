package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 22:29
 */
public class TransactionNotFoundException extends RuntimeException {
    public TransactionNotFoundException(String message) {
        super(message);
    }
}
