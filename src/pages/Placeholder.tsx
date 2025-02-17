
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Placeholder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Em Desenvolvimento</h1>
        <p className="text-muted-foreground mb-8">
          Esta página está em construção
        </p>
        <Button onClick={() => navigate("/")}>Voltar para Home</Button>
      </div>
    </div>
  );
};

export default Placeholder;
