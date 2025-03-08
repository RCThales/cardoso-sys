import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Rentals";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import InvoiceHistory from "./pages/InvoiceHistory";
import CreateInvoice from "./pages/CreateInvoice";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Financial from "./pages/Financial";
import FinancialDetails from "./pages/FinancialDetails";
import Investments from "./pages/Investments";
import Clients from "./pages/Clients";
import ProtectedRoute from "./utils/protectedRoutes";
import Sales from "./pages/Sales";
import Rentals from "./pages/Rentals";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rentals"
            element={
              <ProtectedRoute>
                <Rentals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/create"
            element={
              <ProtectedRoute>
                <CreateInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/history"
            element={
              <ProtectedRoute>
                <InvoiceHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial"
            element={
              <ProtectedRoute>
                <Financial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial/:year/:month"
            element={
              <ProtectedRoute>
                <FinancialDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <Investments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
