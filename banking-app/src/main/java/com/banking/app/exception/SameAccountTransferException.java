package com.banking.app.exception;

/**
 * @author onkardangi
 * @date 5/6/26
 * @time 14:54
 */
public class SameAccountTransferException extends RuntimeException {
    public SameAccountTransferException(String message) {
        super(message);
    }
}
