package com.keurope.auth;

import com.keurope.common.InvalidInputException;
import java.util.regex.Pattern;

public final class PasswordPolicy {

    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[!@#$%^&*]");

    private PasswordPolicy() {
    }

    public static void validate(String password) {
        if (password.length() < 10) {
            throw new InvalidInputException("password must be at least 10 characters");
        }
        if (!UPPER.matcher(password).find()) {
            throw new InvalidInputException("password must contain at least 1 uppercase letter");
        }
        if (!LOWER.matcher(password).find()) {
            throw new InvalidInputException("password must contain at least 1 lowercase letter");
        }
        if (!DIGIT.matcher(password).find()) {
            throw new InvalidInputException("password must contain at least 1 number");
        }
        if (!SPECIAL.matcher(password).find()) {
            throw new InvalidInputException("password must contain at least 1 special character (!@#$%^&*)");
        }
    }
}
