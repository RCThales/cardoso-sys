
import { useState, useEffect } from "react";
import { calculateTotalPrice } from "../utils/priceCalculator";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";

const SPECIAL_RATES = [
  { days: 10, price: 40 },
  { days: 15, price: 50 },
  { days: 30, price: 75 },
  { days: 60, price: 120 },
];

export const RentalCalculator = () => {
  const [days, setDays] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    setPrice(calculateTotalPrice(days));
  }, [days]);

  const handleDaysChange = (value: number[]) => {
    setDays(value[0]);
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-8 shadow-lg animate-fade-in">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="mb-2">
            Rental Calculator
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight">
            Calculate Your Rental
          </h1>
          <p className="text-muted-foreground">
            Adjust the slider to see your rental price
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rental Duration</span>
              <span className="text-sm text-muted-foreground">{days} days</span>
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
              <span className="text-sm text-muted-foreground">Total Price</span>
              <div className="text-5xl font-semibold tracking-tight">
                ${price.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {price / days <= 2 && "Best value!"}
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
                <div className="font-medium">{specialDays} days</div>
                <div className="text-sm text-muted-foreground">
                  ${specialPrice}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
