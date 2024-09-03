// src/utils/checkErrorMessage.ts
import { ErrorManager } from '../errors/ErrorManager';

export const checkErrorMessage = (message: string): void => {
  ErrorManager.handleError(message);
};
