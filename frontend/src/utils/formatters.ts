/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Format a date string to a readable format (e.g., "Jan 15, 2024")
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date string to include time (e.g., "Jan 15, 2024 at 3:30 PM")
 * @param dateString - ISO date string
 * @returns Formatted datetime string
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Capitalize first letter of a string
 * @param str - Input string
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert kebab-case or snake_case to Title Case
 * @param str - Input string
 * @returns Title case string
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Input text
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncate = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format case number with leading zeros (e.g., "CASE-0001")
 * @param caseNumber - Case number string
 * @returns Formatted case number
 */
export const formatCaseNumber = (caseNumber: string): string => {
  if (!caseNumber) return '';
  // If already formatted, return as is
  if (caseNumber.startsWith('CASE-')) return caseNumber;
  // Otherwise, add prefix
  return `CASE-${caseNumber}`;
};

/**
 * Get initials from a full name
 * @param fullName - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (fullName: string): string => {
  if (!fullName) return '';
  const names = fullName.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Validate email format
 * @param email - Email address
 * @returns True if valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param phone - Phone number
 * @returns True if valid phone
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Generate a random color for avatars
 * @param seed - Seed string (e.g., user ID or name)
 * @returns HSL color string
 */
export const generateColorFromString = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
};
