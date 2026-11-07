package com.keurope.common;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public final class Responses {

    private static final MediaType TEXT_PLAIN_UTF8 = MediaType.parseMediaType("text/plain; charset=utf-8");

    private Responses() {
    }

    /** Equivalent of Go's http.Error: plain text body with a trailing newline. */
    public static ResponseEntity<Object> plainError(HttpStatus status, String message) {
        return ResponseEntity.status(status).contentType(TEXT_PLAIN_UTF8).body(message + "\n");
    }

    public static ResponseEntity<Object> apiError(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(ApiResponse.error(code, message));
    }

    /** The admin endpoints' { "error": "..." } shape. */
    public static ResponseEntity<Object> simpleError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
