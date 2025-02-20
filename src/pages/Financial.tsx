
import { DragDropContext, Droppable, Draggable } from "@dnd-kit/core";
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

const Financial = () => {
  const [items, setItems] = useState(initialItems);
  const navigate = useNavigate();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestão Financeira</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="cards">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => navigate(item.route)}
                      className="cursor-pointer"
                    >
                      <Card className="p-6 hover:bg-accent transition-colors">
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Financial;
