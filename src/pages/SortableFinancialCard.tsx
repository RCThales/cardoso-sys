import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FinancialCard } from "@/components/financial/FinancialCard";

export const SortableFinancialCard = ({ id, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FinancialCard
        title={""}
        value={0}
        description={""}
        icon={undefined}
        iconColor={""}
        {...props}
      />
    </div>
  );
};
