
export interface ClientData {
  name: string;
  cpf: string;
  phone: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string; // Added neighborhood field
  city: string;
  state: string;
  postalCode: string;
  isPaid: boolean;
  deliveryFee: number;
  specialDiscount: number;
}

export interface ClientFormProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}
