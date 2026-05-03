package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:20
 */
public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String message) {
        super(message);
    }
}
