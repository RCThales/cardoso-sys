
import { useState, useEffect } from "react";
import { calculateTotalPrice, PRODUCTS, getProductConstants } from "../utils/priceCalculator";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Info } from "lucide-react";

const SPECIAL_RATES = [
  { days: 10, price: 40 },
  { days: 15, price: 50 },
  { days: 30, price: 75 },
  { days: 60, price: 120 },
];

export const RentalCalculator = () => {
  const [days, setDays] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("muletas-axilares");

  useEffect(() => {
    setPrice(calculateTotalPrice(days, selectedProduct));
  }, [days, selectedProduct]);

  const handleDaysChange = (value: number[]) => {
    setDays(value[0]);
  };

  const constants = getProductConstants(selectedProduct);

  return (
    <>
      <Card className="w-full max-w-lg mx-auto p-8 shadow-lg animate-fade-in">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              Calculadora de Aluguel
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight">
              Calcule seu Aluguel
            </h1>
            <p className="text-muted-foreground">
              Ajuste o controle deslizante para ver o preço do aluguel
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Produto</span>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duração do Aluguel</span>
                <span className="text-sm text-muted-foreground">{days} dias</span>
              </div>
              <Slider
                value={[days]}
                onValueChange={handleDaysChange}
                min={1}
                max={60}
                step={1}
                className="w-full"
              />
            </div>

            <motion.div
              key={price}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-secondary/50"
            >
              <div className="text-center space-y-2">
                <span className="text-sm text-muted-foreground">Preço Total</span>
                <div className="text-5xl font-semibold tracking-tight">
                  R${price.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {price / days <= 2 && "Melhor valor!"}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {SPECIAL_RATES.map(({ days: specialDays, price: specialPrice }) => (
                <Card
                  key={specialDays}
                  className="p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setDays(specialDays)}
                >
                  <div className="font-medium">{specialDays} dias</div>
                  <div className="text-sm text-muted-foreground">
                    R${specialPrice}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-4 right-4 rounded-full"
            variant="outline"
          >
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Constantes do Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="font-medium">CONSTANTE_VALOR_ALUGUEL_A</div>
              <div className="text-muted-foreground">
                {constants.CONSTANTE_VALOR_ALUGUEL_A}
              </div>
            </div>
            <div>
              <div className="font-medium">CONSTANTE_VALOR_ALUGUEL_B</div>
              <div className="text-muted-foreground">
                {constants.CONSTANTE_VALOR_ALUGUEL_B}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
