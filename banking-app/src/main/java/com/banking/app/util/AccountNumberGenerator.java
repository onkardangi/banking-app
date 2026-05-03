package com.banking.app.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * @author onkardangi
 * @date 5/2/26
 * @time 14:19
 */
@Component
public class AccountNumberGenerator {

    private static final String BANK_CODE = "1234"; // First 4 digits (bank identifier)
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates a unique 16-digit account number
     * Format: BBBB-XXXX-XXXX-XXXX
     * B = Bank code (1234)
     * X = Random digits
     */
    public String generate() {
        StringBuilder accountNumber = new StringBuilder(BANK_CODE);

        // Generate 12 random digits
        for (int i = 0; i < 12; i++) {
            accountNumber.append(random.nextInt(10));
        }

        return accountNumber.toString();
    }

    /**
     * Formats account number with hyphens for display
     * Example: 1234567890123456 -> 1234-5678-9012-3456
     */
    public static String format(String accountNumber) {
        if (accountNumber == null || accountNumber.length() != 16) {
            return accountNumber;
        }

        return accountNumber.substring(0, 4) + "-" +
                accountNumber.substring(4, 8) + "-" +
                accountNumber.substring(8, 12) + "-" +
                accountNumber.substring(12, 16);
    }
}
