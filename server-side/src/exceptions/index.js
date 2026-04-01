/**
 * Custom Exception Classes
 */

class BaseException extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

class ValidationException extends BaseException {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, 422, code);
  }
}

class AuthException extends BaseException {
  constructor(message, code = 'AUTH_ERROR') {
    super(message, 401, code);
  }
}

class ForbiddenException extends BaseException {
  constructor(message, code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

class NotFoundException extends BaseException {
  constructor(message, code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

class ConflictException extends BaseException {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

class DatabaseException extends BaseException {
  constructor(message, code = 'DATABASE_ERROR') {
    super(message, 500, code);
  }
}

module.exports = {
  BaseException,
  ValidationException,
  AuthException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  DatabaseException
};
