import { useEffect, useState } from "react";
import { format, parseISO, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { Plus, Trash, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Investment {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
  installments: number;
  created_at: string | null;
}

interface FinancialCard {
  id: string;
  title: string;
  value: number;
  type: 'grossIncome' | 'netProfit' | 'expenses' | 'investment';
}

const SortableCard = ({ card }: { card: FinancialCard }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const isNetProfit = card.type === 'netProfit';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className={`mb-8 cursor-move ${isNetProfit ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100' : ''}`}>
        <CardHeader>
          <CardTitle>{card.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${isNetProfit ? 'text-purple-700' : ''}`}>
            R$ {formatCurrency(card.value)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const monthOptions = Array.from({ length: 96 }, (_, i) => i + 1);

const Investments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [expenses, setExpenses] = useState<Investment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpenseDialog, setIsExpenseDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Investment | null>(null);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [cardOrder, setCardOrder] = useState<FinancialCard[]>(() => {
    const saved = localStorage.getItem('financialCardOrder');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Total de Investimentos', type: 'investment', value: 0 },
      { id: '2', title: 'Lucro Líquido', type: 'netProfit', value: 0 },
      { id: '3', title: 'Total de Despesas', type: 'expenses', value: 0 },
    ];
  });
  
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    installments: "1",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('financialCardOrder', JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const fetchData = async () => {
    const { data: investmentsData, error: investmentsError } = await supabase
      .from("investments")
      .select("*")
      .order("date", { ascending: false });

    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (investmentsError || expensesError) {
      console.error("Error fetching data:", investmentsError || expensesError);
      return;
    }

    const processedInvestments = (investmentsData || []).map(inv => ({
      ...inv,
      installments: (inv as any).installments || 1
    }));

    const processedExpenses = (expensesData || []).map(exp => ({
      ...exp,
      installments: (exp as any).installments || 1
    }));

    setInvestments(processedInvestments);
    setExpenses(processedExpenses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const table = isExpenseDialog ? "expenses" : "investments";
    const amount = Number(formData.amount) / Number(formData.installments);
    const installmentDates = Array.from({ length: Number(formData.installments) }, (_, i) => {
      const date = new Date(formData.date);
      return addMonths(date, i).toISOString().split('T')[0];
    });

    const installments = installmentDates.map(date => ({
      name: `${formData.name} (${installmentDates.indexOf(date) + 1}/${formData.installments})`,
      amount,
      date,
      description: formData.description || null,
      installments: Number(formData.installments),
    }));

    const { error } = editingItem
      ? await supabase
          .from(table)
          .update(installments[0])
          .eq("id", editingItem.id)
      : await supabase.from(table).insert(installments);

    if (error) {
      toast({
        title: `Erro ao ${editingItem ? "editar" : "adicionar"} ${isExpenseDialog ? "despesa" : "investimento"}`,
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${isExpenseDialog ? "Despesa" : "Investimento"} ${editingItem ? "editado" : "adicionado"}`,
      description: `${isExpenseDialog ? "A despesa" : "O investimento"} foi ${editingItem ? "atualizado" : "registrado"} com sucesso`,
    });

    setIsDialogOpen(false);
    setFormData({
      name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      installments: "1",
    });
    setEditingItem(null);
    fetchData();
  };

  const handleEdit = (item: Investment) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      date: item.date,
      description: item.description || "",
      installments: item.installments?.toString() || "1",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: Investment) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const table = isExpenseDialog ? "expenses" : "investments";
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", itemToDelete.id);

    if (error) {
      toast({
        title: `Erro ao excluir ${isExpenseDialog ? "despesa" : "investimento"}`,
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${isExpenseDialog ? "Despesa" : "Investimento"} excluído`,
      description: `${isExpenseDialog ? "A despesa" : "O investimento"} foi removido com sucesso`,
    });

    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
    fetchData();
  };

  const getFilteredItems = (items: Investment[]) => {
    return items.filter(item => {
      const date = new Date(item.date);
      return (
        date.getFullYear().toString() === selectedYear &&
        (date.getMonth() + 1).toString() === selectedMonth
      );
    });
  };

  const totalInvestment = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  const netProfit = totalInvestment - totalExpenses;

  useEffect(() => {
    setCardOrder(cards => cards.map(card => ({
      ...card,
      value: card.type === 'investment' ? totalInvestment : 
             card.type === 'expenses' ? totalExpenses :
             card.type === 'netProfit' ? netProfit : card.value
    })));
  }, [totalInvestment, totalExpenses, netProfit]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investimentos e Despesas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os investimentos e despesas em equipamentos, impostos, infraestrutura e
              marketing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsExpenseDialog(false);
                setIsDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? `Editar ${isExpenseDialog ? "Despesa" : "Investimento"}`
                    : `Adicionar ${isExpenseDialog ? "Despesa" : "Investimento"}`}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-1 block">
                    Nome
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="text-sm font-medium mb-1 block">
                    Valor Total
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="installments" className="text-sm font-medium mb-1 block">
                    Número de Parcelas
                  </label>
                  <Select
                    value={formData.installments}
                    onValueChange={(value) => setFormData({ ...formData, installments: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o número de parcelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}x de R$ {formatCurrency(Number(formData.amount) / month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="date" className="text-sm font-medium mb-1 block">
                    Data da Primeira Parcela
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium mb-1 block">
                    Descrição
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingItem ? "Salvar" : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsExpenseDialog(true);
                setIsDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Editar Despesa" : "Adicionar Despesa"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-1 block">
                    Nome
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="text-sm font-medium mb-1 block">
                    Valor Total
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="installments" className="text-sm font-medium mb-1 block">
                    Número de Parcelas
                  </label>
                  <Select
                    value={formData.installments}
                    onValueChange={(value) => setFormData({ ...formData, installments: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o número de parcelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}x de R$ {formatCurrency(Number(formData.amount) / month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="date" className="text-sm font-medium mb-1 block">
                    Data da Primeira Parcela
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium mb-1 block">
                    Descrição
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingItem ? "Salvar" : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {format(new Date(2024, month - 1), 'MMMM', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-3 gap-4">
                {cardOrder.map((card) => (
                  <SortableCard key={card.id} card={card} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold mb-4">
            {isExpenseDialog ? "Despesas" : "Investimentos"} do Período
          </h2>
          {getFilteredItems(isExpenseDialog ? expenses : investments).map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      R$ {formatCurrency(item.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {format(parseISO(item.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {item.description && (
                  <p className="text-sm">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir {isExpenseDialog ? "a despesa" : "o investimento"}{" "}
                {itemToDelete?.name}? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;
