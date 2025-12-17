/**
 * Application-wide constants and configuration values.
 * These values define core business rules and enumerated types used throughout the API.
 */
export const AppConstants = {
  // Pagination defaults and limits
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,

  // User role definitions
  ROLES: {
    ADMIN: 'admin',
    LAWYER: 'lawyer',
    CLIENT: 'client',
  } as const,

  // Legal practice area specializations
  SPECIALTIES: [
    'criminal',
    'corporate',
    'family',
    'immigration',
    'intellectual-property',
    'real-estate',
    'tax',
    'labor',
    'bankruptcy',
    'personal-injury',
  ] as const,

  // Booking lifecycle states
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  } as const,

  // Payment transaction states
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  } as const,
} as const;