const CONSTANTS = {
  USER_ROLES: {
    ADMIN: "admin",
    USER: "user",
  },

  QUOTATION_STATUS: {
    DRAFT: "draft",
    SENT: "sent",
    VIEWED: "viewed",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    EXPIRED: "expired",
  },

  DISCOUNT_TYPES: {
    PERCENTAGE: "percentage",
    FIXED: "fixed",
  },

  DEFAULTS: {
    QUOTATION_VALIDITY: 30,
    QUOTATION_PREFIX: "QUO",
    PRODUCT_UNIT: "pcs",
    TAX_RATE: 0,
    DISCOUNT_VALUE: 0,
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    TERMS_MAX_LENGTH: 2000,
    NOTES_MAX_LENGTH: 1000,
    PASSWORD_MIN_LENGTH: 6,
  },

  MESSAGES: {
    SUCCESS: {
      CREATED: "Created successfully",
      UPDATED: "Updated successfully",
      DELETED: "Deleted successfully",
      FETCHED: "Data fetched successfully",
    },
    ERROR: {
      NOT_FOUND: "Resource not found",
      UNAUTHORIZED: "Unauthorized access",
      FORBIDDEN: "Access forbidden",
      VALIDATION_ERROR: "Validation error",
      SERVER_ERROR: "Internal server error",
      DUPLICATE_ENTRY: "Resource already exists",
    },
  },
};

module.exports = CONSTANTS;
