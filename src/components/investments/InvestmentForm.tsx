
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";

interface InvestmentFormProps {
  formData: {
    name: string;
    amount: string;
    date: string;
    description: string;
    installments: string;
    is_recurring: boolean;
  };
  setFormData: (formData: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editingItem: any | null;
  activeTab: "investments" | "expenses" | "recurrings";
}

const monthOptions = Array.from({ length: 96 }, (_, i) => i + 1);

export const InvestmentForm = ({
  formData,
  setFormData,
  onSubmit,
  editingItem,
  activeTab,
}: InvestmentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium mb-1 block">
          Nome
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="amount" className="text-sm font-medium mb-1 block">
          {activeTab === "recurrings" ? "Valor Mensal" : "Valor Total"}
        </label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      {activeTab !== "recurrings" && (
        <div>
          <label htmlFor="installments" className="text-sm font-medium mb-1 block">
            Número de Parcelas
          </label>
          <Select
            value={formData.installments}
            onValueChange={(value) =>
              setFormData({ ...formData, installments: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o número de parcelas" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {month}x de R${" "}
                  {formatCurrency(
                    formData.amount ? Number(formData.amount) / month : 0
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label htmlFor="date" className="text-sm font-medium mb-1 block">
          {editingItem
            ? "Data"
            : activeTab === "recurrings"
            ? "Data Inicial"
            : "Data da Primeira Parcela"}
        </label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
        />
      </div>

      <Button type="submit" className="w-full">
        {editingItem ? "Salvar" : "Adicionar"}
      </Button>
    </form>
  );
};
