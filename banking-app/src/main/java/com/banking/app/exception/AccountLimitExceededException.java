package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:21
 */
public class AccountLimitExceededException extends RuntimeException {
    public AccountLimitExceededException(String message) {
        super(message);
    }
}
