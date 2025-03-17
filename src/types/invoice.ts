
export interface ClientData {
  name: string;
  cpf: string;
  phone: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string; // New field for neighborhood/administrative region
  city: string;
  state: string;
  postalCode: string;
  isPaid: boolean;
  deliveryFee: number;
  specialDiscount: number;
}

export const DEFAULT_CLIENT_DATA: ClientData = {
  name: "",
  cpf: "",
  phone: "",
  address: "",
  addressNumber: "",
  addressComplement: "",
  neighborhood: "", // New field with empty default
  city: "",
  state: "",
  postalCode: "",
  isPaid: false,
  deliveryFee: 0,
  specialDiscount: 0,
};
