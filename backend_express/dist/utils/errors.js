export class AppError extends Error {
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
export class ValidationError extends AppError {
    constructor(message, details) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource) {
        super('NOT_FOUND', `${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends AppError {
    constructor(message) {
        super('CONFLICT', message, 409);
        this.name = 'ConflictError';
    }
}
export class ServerError extends AppError {
    constructor(message = 'Internal server error') {
        super('SERVER_ERROR', message, 500);
        this.name = 'ServerError';
    }
}
//# sourceMappingURL=errors.js.map