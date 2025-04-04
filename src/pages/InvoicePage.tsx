
import { InvoiceHistory as InvoiceHistoryComponent } from "@/components/InvoiceHistory";

const InvoicePage = () => {
  return (
    <InvoiceHistoryComponent
      search=""
      sortOrder="desc"
      filterStatus="not-returned"
      dateSortType="invoice"
      filterType="all"
      showFeeInfo={true}
    />
  );
};

export default InvoicePage;
