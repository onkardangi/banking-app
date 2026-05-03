package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 22:29
 */
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
