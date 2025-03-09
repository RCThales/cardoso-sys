import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import HCaptcha from "@hcaptcha/react-hcaptcha"; // Import hCaptcha

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(""); // Store hCaptcha token

  const captcha = useRef<any>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        title: "Erro ao fazer login",
        description: "Por favor, verifique o CAPTCHA.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log(password);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captcha_token: captchaToken, // Pass the hCaptcha token to Supabase
        },
      });

      if (error) throw error;

      captcha.current.resetCaptcha();

      navigate("/"); // Navigate to the home page after successful login
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearEmail = () => {
    setEmail("");
  };

  const clearPassword = () => {
    setPassword("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token); // Store the token from hCaptcha
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 relative">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 -top-1/2 transform translate-y-1/2 h-8 w-8"
                  onClick={clearEmail}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="absolute right-2 -top-1/2 transform translate-y-1/2 flex">
                {password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-1"
                    onClick={clearPassword}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Add hCaptcha widget */}
            <div className="hcaptcha">
              <HCaptcha
                ref={captcha}
                sitekey="9b8cf42a-ec68-4e5a-a5a0-daba92fa2a9a"
                onVerify={handleCaptchaChange} // Get the token when hCaptcha is solved
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
