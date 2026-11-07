package com.keurope.common;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;

public final class Timestamps {

    private static final Pattern SQLITE_DATETIME = Pattern.compile("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}");
    private static final DateTimeFormatter SQLITE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Timestamps() {
    }

    /**
     * SQLite CURRENT_TIMESTAMP values are UTC "yyyy-MM-dd HH:mm:ss". The Go driver
     * returned them as RFC 3339, so convert to keep the JSON identical.
     */
    public static String toRfc3339(String value) {
        if (value == null) {
            return "";
        }
        if (SQLITE_DATETIME.matcher(value).matches()) {
            return value.replace(' ', 'T') + "Z";
        }
        return value;
    }

    /** UTC timestamp in the same format as SQLite's datetime('now'), so the two compare correctly. */
    public static String utcPlusHours(long hours) {
        return LocalDateTime.now(ZoneOffset.UTC).plusHours(hours).format(SQLITE_FORMAT);
    }
}
