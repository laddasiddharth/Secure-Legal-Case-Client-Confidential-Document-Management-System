// Authentication
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const MAX_LOGIN_ATTEMPTS = 5;
export const SESSION_EXPIRY_HOURS = 24;
export const PASSWORD_MIN_LENGTH = 8;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
export const ALLOWED_FILE_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
];

// Case Types
export const CASE_TYPES = [
  'civil',
  'criminal',
  'corporate',
  'family',
  'property',
  'intellectual-property',
  'other',
] as const;

// Case Status
export const CASE_STATUS = ['open', 'pending', 'closed', 'archived'] as const;

// Case Priority
export const CASE_PRIORITY = ['low', 'medium', 'high', 'urgent'] as const;

// Document Types
export const DOCUMENT_TYPES = [
  'evidence',
  'contract',
  'agreement',
  'certificate',
  'report',
  'other',
] as const;

// User Roles
export const USER_ROLES = ['admin', 'lawyer', 'client'] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Toast Duration
export const TOAST_DURATION = 5000; // 5 seconds

// API Timeout
export const API_TIMEOUT = 30000; // 30 seconds

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// Regex Patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Registration successful! Please login.',
  CASE_CREATED: 'Case created successfully!',
  CASE_UPDATED: 'Case updated successfully',
  CASE_DELETED: 'Case deleted successfully',
  DOCUMENT_UPLOADED: 'Document uploaded and encrypted successfully!',
  DOCUMENT_DELETED: 'Document deleted successfully',
  DOCUMENT_SIGNED: 'Document signed successfully!',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
} as const;
