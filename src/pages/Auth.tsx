
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Webcam from "react-webcam";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        toast({
          title: "Foto capturada com sucesso",
          description: "Funcionalidade em desenvolvimento",
        });
        setShowCamera(false);
      }
    }
  }, [toast]);

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/25a6caa4-8d3c-4b1a-a64c-57409797e579.png" 
              alt="Cardoso Logo" 
              className="h-28 w-auto"
            />
          </div>
          <p className="text-muted-foreground">
            Entre com suas credenciais para acessar
          </p>
        </CardHeader>
        <CardContent>
          {showCamera ? (
            <div className="space-y-4">
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full rounded-lg"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  <Button onClick={capture} className="bg-white/80 hover:bg-white">
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowCamera(false)}
                    className="bg-white/80 hover:bg-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou
                  </span>
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Login com Reconhecimento Facial
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
