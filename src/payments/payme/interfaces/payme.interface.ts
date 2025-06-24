// src/payments/interfaces/payme.interface.ts

/**
 * Payload structure received from Payme webhook
 */
export interface PaymeTransactionPayload {
    transaction_id: string;
    order_id: string;
    status: 'success' | 'failed' | 'pending' | 'created' | string; // Add others if Payme sends more
    amount: number;
    customer_email: string;
    [key: string]: any; // In case Payme adds extra fields
  }
  
  /**
   * Parameters to initiate a payment with Payme
   */
  export interface CreatePaymeParams {
    amount: number;
    orderId: string;
  }
  
  /**
   * Structure of a transaction in the app
   */
  export interface TransactionData {
    orderId: string;
    paymentToken: string;
    amount: number;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  /**
   * Interface for updating a transaction status
   */
  export interface UpdateTransactionStatusParams {
    transactionId: string;
    status: string;
  }
  
  /**
   * Interface for the response received from Payme API
   */
  export interface PaymeApiResponse {
    id: string;
    result?: any;
    error?: {
      code: number;
      message: string;
      data?: any;
    };
  }
  
  /**
   * Interface for the card.create request payload sent to Payme
   */
  export interface PaymeCardCreateRequest {
    id: string;
    method: 'cards.create';
    params: {
      card: {
        number: string;
        expire: string;
      };
      amount: number;
      account: {
        order_id: string;
      };
    };
  }
  
  /**
   * Interface for verifying a payment via token
   */
  export interface PaymeVerifyPaymentRequest {
    id: string;
    method: 'cards.get_verify_code';
    params: {
      token: string;
    };
  }
  