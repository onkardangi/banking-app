package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 11:50
 */
public class InvalidCredentialsException extends  RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
