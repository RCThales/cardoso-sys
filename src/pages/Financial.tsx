
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface CardItem {
  id: string;
  title: string;
  description: string;
  route: string;
}

const initialItems: CardItem[] = [
  {
    id: "1",
    title: "Investimentos",
    description: "Gestão de investimentos e despesas em equipamentos, impostos, infraestrutura e marketing.",
    route: "/investments",
  },
  {
    id: "2",
    title: "Faturamento",
    description: "Análise detalhada do faturamento mensal e anual.",
    route: "/financial/billing",
  },
  {
    id: "3",
    title: "Fluxo de Caixa",
    description: "Controle de entradas e saídas financeiras.",
    route: "/financial/cash-flow",
  },
  {
    id: "4",
    title: "Relatórios",
    description: "Relatórios financeiros e indicadores de desempenho.",
    route: "/financial/reports",
  },
];

const SortableCard = ({ item }: { item: CardItem }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(item.route)}
      className="cursor-pointer"
    >
      <Card className="p-6 hover:bg-accent transition-colors">
        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
        <p className="text-muted-foreground">{item.description}</p>
      </Card>
    </div>
  );
};

const Financial = () => {
  const [items, setItems] = useState(initialItems);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = [...items];
    const [movedItem] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, movedItem);

    setItems(newItems);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestão Financeira</h1>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {items.map((item) => (
              <SortableCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Financial;
