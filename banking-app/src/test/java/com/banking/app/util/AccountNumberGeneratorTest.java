package com.banking.app.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AccountNumberGeneratorTest {

    @InjectMocks
    private AccountNumberGenerator generator;

    @Test
    void generate_returns16Digits() {
        String accountNumber = generator.generate();

        assertThat(accountNumber).hasSize(16);
        assertThat(accountNumber).matches("\\d{16}");
    }

    @Test
    void generate_startsWithBankPrefix() {
        String accountNumber = generator.generate();

        assertThat(accountNumber).startsWith("1234");
    }

    @Test
    void generate_uniqueNumbers() {
        Set<String> numbers = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            numbers.add(generator.generate());
        }

        // 100 generated numbers should all be unique
        assertThat(numbers).hasSize(100);
    }
}
