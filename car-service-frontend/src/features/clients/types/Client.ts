export interface ClientDto {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface CreateClientDto {
  fullName: string;
  phone: string;
  email: string | null;
}