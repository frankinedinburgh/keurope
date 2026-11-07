package com.keurope.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Discriminated union envelope: { status: "success", data } | { status: "error", error }. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse(String status, Object data, ErrorBody error) {

    public record ErrorBody(String code, String message) {
    }

    public static ApiResponse success(Object data) {
        return new ApiResponse("success", data, null);
    }

    public static ApiResponse error(String code, String message) {
        return new ApiResponse("error", null, new ErrorBody(code, message));
    }
}
