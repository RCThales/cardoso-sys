
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import InvoicePage from "./pages/InvoicePage";
import Inventory from "./pages/Inventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Router>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calc" element={<Index />} />
          <Route path="/temp1" element={<InvoicePage />} />
          <Route path="/temp2" element={<Inventory />} />
          <Route path="/temp3" element={<Placeholder />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
