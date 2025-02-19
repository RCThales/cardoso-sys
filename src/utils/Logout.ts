import { supabase } from "@/integrations/supabase/client";

export const handleLogout = async (navigate) => {
  await supabase.auth.signOut();
  navigate("/auth"); // Redireciona para a página de autenticação
};
