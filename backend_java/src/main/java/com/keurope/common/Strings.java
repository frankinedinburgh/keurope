package com.keurope.common;

public final class Strings {

    private Strings() {
    }

    /** Go decodes missing JSON strings as "", so treat null the same way. */
    public static String orEmpty(String value) {
        return value == null ? "" : value;
    }

    public static boolean isEmpty(String value) {
        return value == null || value.isEmpty();
    }
}
