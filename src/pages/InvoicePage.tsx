
import { InvoiceHistory as InvoiceHistoryComponent } from "@/components/InvoiceHistory";

const InvoicePage = () => {
  return (
    <InvoiceHistoryComponent
      search=""
      sortOrder="desc"
      filterStatus="all"
    />
  );
};

export default InvoicePage;
