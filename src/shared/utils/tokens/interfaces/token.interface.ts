// src/shared/utils/tokens/interfaces/token.interface.ts
export interface TokenPayload {
    _id: string;
    role: string;
    [key: string]: any;
  }