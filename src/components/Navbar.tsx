
import { Accessibility } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        // Still navigate to auth page even if there's an error
        // since the error usually means user is already logged out
      }
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Você será redirecionado para a página de login.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div
          className="flex gap-2 items-center mr-4 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Accessibility className="h-8 w-8" />
          <span className="font-semibold">CARDOSO SYS</span>
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="mr-6"
        >
          Sair
        </Button>
      </div>
    </nav>
  );
};
