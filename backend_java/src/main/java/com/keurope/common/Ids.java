package com.keurope.common;

import java.security.SecureRandom;
import java.util.HexFormat;

public final class Ids {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Ids() {
    }

    /** 32 hex characters, same format as the Go generateID. */
    public static String generate() {
        return randomHex(16);
    }

    public static String randomHex(int bytes) {
        byte[] b = new byte[bytes];
        RANDOM.nextBytes(b);
        return HexFormat.of().formatHex(b);
    }
}
