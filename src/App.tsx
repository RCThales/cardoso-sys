
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import InvoiceHistory from "@/pages/InvoiceHistory";
import CreateInvoice from "@/pages/CreateInvoice";
import InvoicePage from "@/pages/InvoicePage";
import Financial from "@/pages/Financial";
import Products from "@/pages/Products";
import Clients from "@/pages/Clients";
import Investments from "@/pages/Investments";
import FinancialDetails from "./pages/FinancialDetails";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/inventory",
    element: <Inventory />,
  },
  {
    path: "/invoices/history",
    element: <InvoiceHistory />,
  },
  {
    path: "/invoices/new",
    element: <CreateInvoice />,
  },
  {
    path: "/invoices/:id",
    element: <InvoicePage />,
  },
  {
    path: "/financial",
    element: <Financial />,
  },
  {
    path: "/financial/:month",
    element: <FinancialDetails />,
  },
  {
    path: "/clients",
    element: <Clients />,
  },
  {
    path: "/investments",
    element: <Investments />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
