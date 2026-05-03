package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:30
 */
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
