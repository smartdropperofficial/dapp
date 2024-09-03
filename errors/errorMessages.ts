// src/errors/errorMessages.ts
export const UNAUTHORIZED = {
  name: 'Unauthorized',
  messages: ['Not authorized', 'OwnableUnauthorizedAccount'],
};

export const PROMOTER_NOT_ACTIVE = {
  name: 'Promoter is not active',
  messages: ['Promoter is not active'],
};

export const INVALID_PROMOTER_ADDRESS = {
  name: "Promoter's address not valid",
  messages: ["Promoter's address not valid"],
};

export const INVALID_PERCENTAGE = {
  name: 'The percentage must be between 0 and 100',
  messages: ['The percentage must be between 0 and 100'],
};

export const INVALID_SUBSCRIPTION_TYPE_ID = {
  name: 'Invalid subscription type ID',
  messages: ['Invalid subscription type ID'],
};

export const INVALID_SUBSCRIPTION_ID = {
  name: 'Invalid subscription ID',
  messages: ['Invalid subscription ID'],
};

export const PROMOTER_EXISTS = {
  name: 'Promoter already exists',
  messages: ['Promoter already exists'],
};

export const PROMOTER_NOT_EXISTS = {
  name: 'Promoter does not exist',
  messages: ['Promoter does not exist'],
};

export const SHOP_LIMIT_REACHED = {
  name: 'Shop limit reached',
  messages: ['Shop limit reached'],
};

export const SUBSCRIPTION_MODEL_NOT_ENABLED = {
  name: 'Subscription model is not enabled',
  messages: ['Subscription model is not enabled'],
};

export const NO_PROFIT_AVAILABLE = {
  name: 'No profit available for withdrawal',
  messages: ['No profit available for withdrawal'],
};

export const INSUFFICIENT_FUNDS = {
  name: 'Insufficient funds in contract',
  messages: ['Insufficient funds in contract'],
};
export const TRANSACTION_ERROR = {
  name: 'Transaction error',
  messages: ['rejected transaction'],
};
