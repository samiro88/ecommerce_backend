export interface ClientLoginResponse {
  status: string;
  message: string;
  user: {
    id: string;
    email: string;
    name?: string;
    phone1?: string;
    ville?: string;
    address?: string;
  };
  token: string;
}

export interface ClientRegisterResponse {
  status: string;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone1: string;
    ville: string;
    address: string;
  };
  token: string;
}