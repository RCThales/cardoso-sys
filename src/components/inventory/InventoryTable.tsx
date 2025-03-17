import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { InventorySearch } from "./InventorySearch";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryAdjustModal } from "./InventoryAdjustModal";
import { SingleSizeInventoryRow } from "./SingleSizeInventoryRow";
import { MultiSizeInventoryRow } from "./MultiSizeInventoryRow";
import { useInventory } from "./useInventory";
import Loader from "../loader";

export const InventoryTable = () => {
  const {
    inventory,
    products,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    showRented,
    setShowRented,
    showAvailable,
    setShowAvailable,
    selectedItem,
    setSelectedItem,
    handleUpdateQuantity,
    isUpdating,
  } = useInventory();

  if (isLoading || !products) {
    return <Loader />;
  }

  const groupedInventory = inventory?.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = [];
    }
    acc[item.product_id].push(item);
    return acc;
  }, {} as Record<string, typeof inventory>);

  const filteredAndGroupedInventory = Object.entries(groupedInventory || {})
    .filter(([productId]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return false;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const items = groupedInventory[productId];
      const hasRented = items.some((item) => item.rented_quantity > 0);
      const hasAvailable = items.some(
        (item) => item.total_quantity - item.rented_quantity > 0
      );

      if (showRented && !hasRented) return false;
      if (showAvailable && !hasAvailable) return false;

      return true;
    })
    .sort(([productIdA], [productIdB]) => {
      const totalA = groupedInventory[productIdA].reduce(
        (sum, item) => sum + item.total_quantity,
        0
      );
      const totalB = groupedInventory[productIdB].reduce(
        (sum, item) => sum + item.total_quantity,
        0
      );
      return sortOrder === "asc" ? totalA - totalB : totalB - totalA;
    });

  return (
    <div className="space-y-4">
      <InventorySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortOrderChange={(value: "asc" | "desc") => setSortOrder(value)}
      />

      <InventoryFilters
        showRented={showRented}
        showAvailable={showAvailable}
        onShowRentedChange={setShowRented}
        onShowAvailableChange={setShowAvailable}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Quantidade Total</TableHead>
            <TableHead className="text-right">Quantidade Alugada</TableHead>
            <TableHead className="text-right">Quantidade Disponível</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndGroupedInventory.map(([productId, items]) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return null;

            const hasSizes = items.some((item) => item.size);

            if (!hasSizes) {
              const item = items[0];
              return (
                <SingleSizeInventoryRow
                  key={productId}
                  product={product}
                  item={item}
                  onAdjust={() => setSelectedItem({ item, product })}
                />
              );
            }

            // Ordenar os items baseado na ordem dos tamanhos do produto
            const sortedItems = items.sort((a, b) => {
              if (!a.size || !b.size) return 0;
              const sizeOrderA =
                product.sizes?.findIndex((s) => s.size === a.size) ?? -1;
              const sizeOrderB =
                product.sizes?.findIndex((s) => s.size === b.size) ?? -1;
              return sizeOrderA - sizeOrderB;
            });

            return (
              <MultiSizeInventoryRow
                key={productId}
                product={product}
                items={sortedItems}
                onAdjust={(item) => setSelectedItem({ item, product })}
              />
            );
          })}
        </TableBody>
      </Table>

      {selectedItem && (
        <InventoryAdjustModal
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          item={selectedItem.item}
          product={selectedItem.product}
          onUpdateQuantity={handleUpdateQuantity}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
