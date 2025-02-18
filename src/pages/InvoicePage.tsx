
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { InvoiceHistory } from "@/components/InvoiceHistory";

const InvoicePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Faturas</h1>
          <p className="text-muted-foreground mt-2">
            Gere e gerencie suas faturas
          </p>
        </div>

        <Tabs defaultValue="generate" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Gerar Fatura</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="generate">
            <InvoiceGenerator />
          </TabsContent>
          <TabsContent value="history">
            <InvoiceHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvoicePage;
