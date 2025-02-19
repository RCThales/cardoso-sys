
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const InvoiceTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nº Fatura</TableHead>
        <TableHead>Data</TableHead>
        <TableHead>Cliente</TableHead>
        <TableHead>Data de Devolução</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead>Pago</TableHead>
        <TableHead>Devolvido</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};
