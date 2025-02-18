
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF } from "@/utils/formatters";

interface ClientSummary {
  cpf: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
}

const Clients = () => {
  const [search, setSearch] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("client_name, client_cpf, total, created_at");

      if (!invoices) return [];

      const clientMap = new Map<string, ClientSummary>();

      invoices.forEach(invoice => {
        const existing = clientMap.get(invoice.client_cpf);
        const total = Number(invoice.total) || 0;

        if (existing) {
          clientMap.set(invoice.client_cpf, {
            ...existing,
            totalSpent: existing.totalSpent + total,
            orderCount: existing.orderCount + 1,
            lastOrderDate: invoice.created_at > existing.lastOrderDate ? invoice.created_at : existing.lastOrderDate
          });
        } else {
          clientMap.set(invoice.client_cpf, {
            cpf: invoice.client_cpf,
            name: invoice.client_name,
            totalSpent: total,
            orderCount: 1,
            lastOrderDate: invoice.created_at
          });
        }
      });

      let clientList = Array.from(clientMap.values());

      if (search) {
        const searchLower = search.toLowerCase();
        clientList = clientList.filter(
          client => 
            client.name.toLowerCase().includes(searchLower) ||
            client.cpf.includes(search)
        );
      }

      return clientList.sort((a, b) => b.totalSpent - a.totalSpent);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          </div>
          
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : (
                  clients?.map((client) => (
                    <TableRow key={client.cpf}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{formatCPF(client.cpf)}</TableCell>
                      <TableCell className="text-right">
                        R$ {client.totalSpent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{client.orderCount}</TableCell>
                      <TableCell>
                        {new Date(client.lastOrderDate).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
