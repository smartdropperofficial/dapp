import Swal from 'sweetalert2';
import {
    UNAUTHORIZED,
    PROMOTER_NOT_ACTIVE,
    INVALID_PROMOTER_ADDRESS,
    INVALID_PERCENTAGE,
    INVALID_SUBSCRIPTION_TYPE_ID,
    INVALID_SUBSCRIPTION_ID,
    PROMOTER_EXISTS,
    PROMOTER_NOT_EXISTS,
    SUBSCRIPTION_MODEL_NOT_ENABLED,
    NO_PROFIT_AVAILABLE,
    INSUFFICIENT_FUNDS,
    TRANSACTION_ERROR,
    SHOP_LIMIT_REACHED
} from './errorMessages';

// Base class for custom errors
class CustomError extends Error {
    constructor(public contextMessage: string, message: string) {
        super(message);
        this.name = this.constructor.name;
        this.showAlert();
    }

    private showAlert(): void {
        Swal.fire({
            icon: 'error',
            title: this.message,
            text: `${this.contextMessage}`,
        });
    }
}

// Unauthorized error
export class UnauthorizedError extends CustomError {
    constructor(message: string) {
        super(message, 'Unauthorized Error');
    }
}

// Validation errors
class ValidationError extends CustomError {
    constructor(message: string) {
        super(message, 'Validation Error');
    }
}

// Existence errors
class ExistenceError extends CustomError {
    constructor(message: string) {
        super(message, 'Existence Error');
    }
}

// Funds errors
class FundsError extends CustomError {
    constructor(message: string) {
        super(message, 'Funds Error');
    }
}
class TransactionError extends CustomError {
    constructor(message: string) {
        super(message, 'Transaction Error');
    }
}

// ErrorManager to handle error creation
export class ErrorManager {
    static handleError(message: string): string | void {
        const isMessageInList = (messages: string[], contextMessage: string): string | null => {
            return messages.find(keyword => contextMessage.includes(keyword)) || null;
        };
        let keyword;
        try {
            keyword = isMessageInList(UNAUTHORIZED.messages, message);
            if (keyword) throw new UnauthorizedError(keyword);

            keyword = isMessageInList(PROMOTER_NOT_ACTIVE.messages, message);
            if (keyword) throw new UnauthorizedError(keyword);

            keyword = isMessageInList(SHOP_LIMIT_REACHED.messages, message);
            if (keyword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Shop limit reached',
                    text: 'Shop limit reached',
                });
                // throw new ValidationError(keyword);
            }

            keyword = isMessageInList(INVALID_PROMOTER_ADDRESS.messages, message);
            if (keyword) {
                Swal.fire({
                    icon: 'error',
                    title: "Promoter's address not valid",
                    text: "Promoter's address not valid",
                });
            }
            keyword = isMessageInList(INVALID_PERCENTAGE.messages, message);
            if (keyword) throw new ValidationError(keyword);

            keyword = isMessageInList(INVALID_SUBSCRIPTION_TYPE_ID.messages, message);
            if (keyword) throw new ValidationError(keyword);

            keyword = isMessageInList(INVALID_SUBSCRIPTION_ID.messages, message);
            if (keyword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid subscription ID',
                    text: 'Invalid subscription ID',
                });
                throw new ValidationError(keyword);
            }

            keyword = isMessageInList(PROMOTER_EXISTS.messages, message);
            if (keyword) {
                return PROMOTER_EXISTS.name!;
            }


            keyword = isMessageInList(PROMOTER_NOT_EXISTS.messages, message);
            if (keyword) throw new ExistenceError(keyword);

            keyword = isMessageInList(SUBSCRIPTION_MODEL_NOT_ENABLED.messages, message);
            if (keyword) throw new ExistenceError(keyword);

            keyword = isMessageInList(NO_PROFIT_AVAILABLE.messages, message);
            if (keyword) throw new FundsError(keyword);

            keyword = isMessageInList(INSUFFICIENT_FUNDS.messages, message);
            if (keyword) throw new FundsError(keyword);

            keyword = isMessageInList(TRANSACTION_ERROR.messages, message);
            if (keyword) throw new TransactionError(keyword);
        } catch (error) {
            throw new CustomError(message, 'Errore sconosciuto');
        }
    }
}
