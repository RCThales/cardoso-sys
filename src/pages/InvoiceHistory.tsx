import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const InvoiceHistory = () => {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "unpaid" | "returned" | "not-returned"
  >("not-returned"); // Default set to "not-returned"
  const [dateSortType, setDateSortType] = useState<"invoice" | "return">(
    "return"
  );
  const [filterType, setFilterType] = useState<
    "all" | "rental" | "sale" | "hybrid"
  >("rental");
  const [todayOnly, setTodayOnly] = useState<boolean>(false); // Added today only state

  const { invoice_id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get("invoice_id");
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
            placeholder="Buscar por nome, CPF, número da fatura ou produtos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="flex flex-wrap gap-4">
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
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas os status</SelectItem>
                <SelectItem value="paid">Somente pagas</SelectItem>
                <SelectItem value="unpaid">Somente não pagas</SelectItem>
                <SelectItem value="returned">Somente devolvidas</SelectItem>
                <SelectItem value="not-returned">
                  Somente não devolvidas
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="rental">Somente Aluguel</SelectItem>
                <SelectItem value="sale">Somente Venda</SelectItem>
                <SelectItem value="hybrid">Somente Híbridos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch
                id="today-only"
                checked={todayOnly}
                onCheckedChange={setTodayOnly}
              />
              <Label htmlFor="today-only">Somente hoje</Label>
            </div>
          </div>
        </div>

        <InvoiceHistoryComponent
          search={search}
          sortOrder={sortOrder}
          filterStatus={filterStatus}
          dateSortType={dateSortType}
          filterType={filterType}
          invoiceId={invoiceId}
          showFeeInfo={true}
          todayOnly={todayOnly}
        />
      </div>
    </div>
  );
};

export default InvoiceHistory;
