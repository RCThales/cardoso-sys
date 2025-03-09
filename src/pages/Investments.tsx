
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { DeleteRecurringDialog } from "@/components/investments/DeleteRecurringDialog";
import { CancelRecurringDialog } from "@/components/investments/CancelRecurringDialog";
import { AddInvestmentDialog } from "@/components/investments/AddInvestmentDialog";
import { FilterBar } from "@/components/investments/FilterBar";
import { InvestmentsList } from "@/components/investments/InvestmentsList";
import { useInvestments } from "@/hooks/useInvestments";

const Investments = () => {
  const {
    activeTab,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isCancelRecurringDialogOpen,
    setIsCancelRecurringDialogOpen,
    itemToDelete,
    itemToCancelRecurring,
    editingItem,
    setEditingItem,
    handleSubmit,
    handleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelRecurringClick,
    handleConfirmCancelRecurring,
    getFilteredItems,
    getAvailableMonths,
    getAvailableYears,
    getButtonLabel,
    getDialogTitle,
    INITIAL_FORM_STATE
  } = useInvestments();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Investimentos e Despesas
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os investimentos, despesas e gastos recorrentes em equipamentos, impostos,
              infraestrutura e marketing.
            </p>
          </div>
        </div>

        <Tabs 
          defaultValue="investments" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "investments" | "expenses" | "recurrings")}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="recurrings">Recorrentes</TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className="mt-4">
            <div className="mb-8">
              <AddInvestmentDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setFormData(INITIAL_FORM_STATE);
                    setEditingItem(null);
                  }
                }}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                editingItem={editingItem}
                activeTab={activeTab}
                buttonLabel={getButtonLabel()}
                dialogTitle={getDialogTitle()}
              />
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4">
            <div className="mb-8">
              <AddInvestmentDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setFormData(INITIAL_FORM_STATE);
                    setEditingItem(null);
                  }
                }}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                editingItem={editingItem}
                activeTab={activeTab}
                buttonLabel={getButtonLabel()}
                dialogTitle={getDialogTitle()}
              />
            </div>
          </TabsContent>

          <TabsContent value="recurrings" className="mt-4">
            <div className="mb-8">
              <AddInvestmentDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setFormData(INITIAL_FORM_STATE);
                    setEditingItem(null);
                  }
                }}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                editingItem={editingItem}
                activeTab={activeTab}
                buttonLabel={getButtonLabel()}
                dialogTitle={getDialogTitle()}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Year/Month filters */}
        <div className="mb-8">
          {(getAvailableYears().length > 0) && (
            <FilterBar
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              availableYears={getAvailableYears()}
              availableMonths={getAvailableMonths()}
            />
          )}

          <div className="grid gap-4">
            <h2 className="text-xl font-semibold mb-4">
              {activeTab === "investments" 
                ? "Investimentos" 
                : activeTab === "expenses" 
                  ? "Despesas" 
                  : "Gastos Recorrentes"} do Período
            </h2>

            <InvestmentsList 
              items={getFilteredItems()}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onCancelRecurring={activeTab === "recurrings" ? handleCancelRecurringClick : undefined}
              isRecurring={activeTab === "recurrings"}
            />
          </div>
        </div>

        {/* Delete dialog for investments/expenses */}
        {activeTab !== "recurrings" && (
          <DeleteProductDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            productName={itemToDelete?.name || ""}
          />
        )}

        {/* Delete dialog for recurring items */}
        {activeTab === "recurrings" && (
          <DeleteRecurringDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            itemName={itemToDelete?.name || ""}
          />
        )}

        {/* Cancel recurring dialog */}
        {activeTab === "recurrings" && (
          <CancelRecurringDialog
            open={isCancelRecurringDialogOpen}
            onOpenChange={setIsCancelRecurringDialogOpen}
            onConfirm={handleConfirmCancelRecurring}
            itemName={itemToCancelRecurring?.name || ""}
          />
        )}
      </div>
    </div>
  );
};

export default Investments;
