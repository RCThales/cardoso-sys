import { useState } from "react";
import { useParams, useLocation } from "react-router-dom"; // Importe useParams e useLocation
import { Navbar } from "@/components/Navbar";
import { InvoiceHistory as InvoiceHistoryComponent } from "@/components/InvoiceHistory";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InvoiceHistory = () => {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "unpaid" | "returned" | "not-returned"
  >("all");
  const [dateSortType, setDateSortType] = useState<"invoice" | "return">(
    "return"
  );

  // Captura o ID da URL (se existir)
  const { invoice_id } = useParams(); // Para path parameters (ex: /invoices/history/:invoice_id)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("invoice_id"); // Para query parameters (ex: /invoices/history?id=123)

  // Define o ID a ser passado (prioriza o path parameter sobre o query parameter)
  const invoiceId = invoice_id || queryId || null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Histórico de Faturas
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize todas as faturas geradas
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Input
            placeholder="Buscar por nome, CPF ou número da fatura"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-4">
            <Select
              value={dateSortType}
              onValueChange={(value) =>
                setDateSortType(value as "invoice" | "return")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Data da Fatura</SelectItem>
                <SelectItem value="return">Data de Devolução</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mais antigas primeiro</SelectItem>
                <SelectItem value="asc">Mais recentes primeiro</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as faturas</SelectItem>
                <SelectItem value="paid">Somente pagas</SelectItem>
                <SelectItem value="unpaid">Somente não pagas</SelectItem>
                <SelectItem value="returned">Somente devolvidas</SelectItem>
                <SelectItem value="not-returned">
                  Somente não devolvidas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Passa o ID para o componente InvoiceHistoryComponent */}
        <InvoiceHistoryComponent
          search={search}
          sortOrder={sortOrder}
          filterStatus={filterStatus}
          dateSortType={dateSortType}
          invoiceId={invoiceId} // Passa o ID capturado da URL
        />
      </div>
    </div>
  );
};

export default InvoiceHistory;
