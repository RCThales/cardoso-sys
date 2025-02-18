
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import InvoiceHistory from "./pages/InvoiceHistory";
import CreateInvoice from "./pages/CreateInvoice";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Financial from "./pages/Financial";
import FinancialDetails from "./pages/FinancialDetails";
import Investments from "./pages/Investments";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calc" element={<Index />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/history" element={<InvoiceHistory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/products" element={<Products />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/financial/:year/:month" element={<FinancialDetails />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
