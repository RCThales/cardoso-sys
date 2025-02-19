// components/ProtectedRoute.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth"); // Redireciona para a página de login se o usuário não estiver autenticado
      }
    };

    checkSession();
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
