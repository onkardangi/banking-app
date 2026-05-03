package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:21
 */
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
