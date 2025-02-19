
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCPF, formatPhone } from "@/utils/formatters";
import type { ClientSummary } from "@/types/client";

interface ClientDetailsDialogProps {
  client: ClientSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientDetailsDialog = ({
  client,
  open,
  onOpenChange,
}: ClientDetailsDialogProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Informações Pessoais</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="font-medium">Nome:</span> {client.name}</p>
              <p><span className="font-medium">CPF:</span> {formatCPF(client.cpf)}</p>
              <p><span className="font-medium">Telefone:</span> {formatPhone(client.phone)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Endereço</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>{client.address}</p>
              {client.addressNumber && (
                <p>Número: {client.addressNumber}</p>
              )}
              {client.addressComplement && (
                <p>Complemento: {client.addressComplement}</p>
              )}
              <p>{client.city} - {client.state}</p>
              <p>CEP: {client.postalCode}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Histórico</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="font-medium">Total Gasto:</span> R$ {client.totalSpent.toFixed(2)}</p>
              <p><span className="font-medium">Quantidade de Pedidos:</span> {client.orderCount}</p>
              <p><span className="font-medium">Último Pedido:</span> {new Date(client.lastOrderDate).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
