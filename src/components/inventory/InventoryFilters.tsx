
import { Switch } from "../ui/switch";

interface InventoryFiltersProps {
  showRented: boolean;
  showAvailable: boolean;
  onShowRentedChange: (value: boolean) => void;
  onShowAvailableChange: (value: boolean) => void;
}

export const InventoryFilters = ({
  showRented,
  showAvailable,
  onShowRentedChange,
  onShowAvailableChange,
}: InventoryFiltersProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={showRented}
          onCheckedChange={onShowRentedChange}
        />
        <span className="text-sm">Mostrar apenas com itens alugados</span>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={showAvailable}
          onCheckedChange={onShowAvailableChange}
        />
        <span className="text-sm">Mostrar apenas com itens disponíveis</span>
      </div>
    </div>
  );
};
