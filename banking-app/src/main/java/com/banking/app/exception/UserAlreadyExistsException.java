package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 11:49
 */
public class UserAlreadyExistsException extends  RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
