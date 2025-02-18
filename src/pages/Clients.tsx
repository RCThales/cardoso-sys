
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientsSearch } from "@/components/clients/ClientsSearch";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientSummary {
  cpf: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
}

const Clients = () => {
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"totalSpent" | "orderCount">("totalSpent");

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", search, orderBy],
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

      return clientList.sort((a, b) => 
        orderBy === "totalSpent" 
          ? b.totalSpent - a.totalSpent
          : b.orderCount - a.orderCount
      );
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
          
          <div className="flex flex-col md:flex-row gap-4">
            <ClientsSearch value={search} onChange={setSearch} />
            <ClientsFilters orderBy={orderBy} onOrderByChange={setOrderBy} />
          </div>

          <ClientsTable clients={clients || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Clients;
