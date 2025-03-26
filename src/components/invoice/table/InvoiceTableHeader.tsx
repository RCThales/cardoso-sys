
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const InvoiceTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Cliente</TableHead>
        <TableHead>Período</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Produtos</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead>Pago</TableHead>
        <TableHead>Devolvido</TableHead>
        <TableHead>Notas</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};
