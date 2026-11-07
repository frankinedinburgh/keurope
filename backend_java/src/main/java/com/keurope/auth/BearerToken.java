package com.keurope.auth;

import jakarta.servlet.http.HttpServletRequest;

public final class BearerToken {

    private BearerToken() {
    }

    /** Returns the token from "Authorization: Bearer <token>", or "" if the header is missing or malformed. */
    public static String extract(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || header.isEmpty()) {
            return "";
        }

        String[] parts = header.split(" ", -1);
        if (parts.length != 2 || !parts[0].equals("Bearer")) {
            return "";
        }

        return parts[1];
    }
}
