export type ApiResponse<T> = {
    status: 'success';
    data: T;
} | {
    status: 'error';
    error: ApiError;
};
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}
//# sourceMappingURL=api.d.ts.map