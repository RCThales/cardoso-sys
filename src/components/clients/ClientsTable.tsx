
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCPF } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ClientSummary } from "@/pages/Clients";

interface ClientsTableProps {
  clients: ClientSummary[];
  isLoading: boolean;
}

export const ClientsTable = ({ clients, isLoading }: ClientsTableProps) => {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead className="text-right">Total Gasto</TableHead>
            <TableHead className="text-right">Quantidade de Pedidos</TableHead>
            <TableHead>Último Pedido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.cpf}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{formatCPF(client.cpf)}</TableCell>
              <TableCell className="text-right">
                R$ {client.totalSpent.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">{client.orderCount}</TableCell>
              <TableCell>
                {format(new Date(client.lastOrderDate), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
