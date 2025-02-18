
export interface ClientData {
  name: string;
  cpf: string;
  phone: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  city: string;
  state: string;
  postalCode: string;
  isPaid: boolean;
  deliveryFee: number;
}

export const DEFAULT_CLIENT_DATA: ClientData = {
  name: "",
  cpf: "",
  phone: "",
  address: "",
  addressNumber: "",
  addressComplement: "",
  city: "",
  state: "",
  postalCode: "",
  isPaid: false,
  deliveryFee: 0,
};
