
// Settings.tsx
import { useEffect, useState } from "react";
import {
  getSettings,
  updateSetting,
} from "../services/settingsService";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Check, CreditCard, Edit, Save } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState<{
    [key: number]: { name: string; fee: number; installments?: any; isEditing?: boolean };
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/auth");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        toast({
          title: "Erro",
          description:
            "Erro ao verificar sua sessão. Por favor, faça login novamente.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (id, field, value) => {
    // Update the edited value for the specific setting
    setEditingSettings((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await updateSetting(id, updatedData);
      fetchSettings();
      toast({
        title: "Configuração atualizada",
        description: "A configuração foi atualizada com sucesso.",
        variant: "default",
      });
      
      // Clear editing state for this item
      setEditingSettings((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao atualizar",
        description: "Houve um erro ao atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  const toggleEditMode = (id, setting) => {
    setEditingSettings((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { 
          name: setting.name, 
          fee: setting.fee, 
          installments: setting.installments 
        }),
        isEditing: !(prev[id]?.isEditing || false),
      },
    }));
  };

  const adjustInstallments = (id, currentInstallments, action) => {
    const currentCount = Object.keys(currentInstallments || {}).length;
    const updatedInstallments = { ...(currentInstallments || {}) };
    
    if (action === 'increase') {
      // Add new installment with default rate
      const newCount = currentCount + 1;
      updatedInstallments[newCount] = 0; 
    } else if (action === 'decrease' && currentCount > 1) {
      // Remove the last installment
      delete updatedInstallments[currentCount];
    }
    
    handleChange(id, "installments", updatedInstallments);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="h-full">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <h2 className="font-bold text-2xl hover:text-[1.6rem] transition-all">
            Tema do Aplicativo
          </h2>
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Seção Pagamentos */}
          <details className="cursor-pointer" open>
            <summary className="font-bold text-2xl hover:text-[1.6rem] transition-all">
              Pagamentos
            </summary>
            <Card>
              {/* Lista de configurações já adicionadas */}
              <CardHeader>
                <CardTitle>Lista de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.length > 0 ? (
                    <div className="space-y-4">
                      {settings.map((setting) => (
                        <div key={setting.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={18} className="text-primary" />
                              <h3 className="font-medium">{setting.name}</h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEditMode(setting.id, setting)}
                            >
                              {editingSettings[setting.id]?.isEditing ? (
                                <Save size={16} className="mr-1" />
                              ) : (
                                <Edit size={16} className="mr-1" />
                              )}
                              {editingSettings[setting.id]?.isEditing ? "Salvar" : "Editar"}
                            </Button>
                          </div>
                          
                          {editingSettings[setting.id]?.isEditing ? (
                            <div className="space-y-4 pt-2 border-t">
                              {/* Editing Mode */}
                              <div className="flex gap-4 w-full flex-wrap">
                                {/* Nome */}
                                <div className="w-full">
                                  <label
                                    htmlFor={`setting-name-${setting.id}`}
                                    className="block text-sm font-medium mb-1"
                                  >
                                    Nome
                                  </label>
                                  <Input
                                    id={`setting-name-${setting.id}`}
                                    type="text"
                                    value={
                                      editingSettings[setting.id]?.name ||
                                      setting.name
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        setting.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                {/* Valor (mostrar apenas se não tiver parcelas) */}
                                {!setting.installments && (
                                  <div className="w-full">
                                    <label
                                      htmlFor={`setting-fee-${setting.id}`}
                                      className="block text-sm font-medium mb-1"
                                    >
                                      Valor
                                    </label>
                                    <Input
                                      id={`setting-fee-${setting.id}`}
                                      type="number"
                                      value={
                                        editingSettings[setting.id]?.fee ||
                                        setting.fee
                                      }
                                      onChange={(e) =>
                                        handleChange(
                                          setting.id,
                                          "fee",
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Mostrar e editar o número de parcelas */}
                              {setting.installments && (
                                <div className="mt-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">
                                      Parcelas
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => adjustInstallments(
                                          setting.id, 
                                          editingSettings[setting.id]?.installments || setting.installments, 
                                          'decrease'
                                        )}
                                      >
                                        <ChevronDown size={14} />
                                      </Button>
                                      <span className="text-sm font-medium">
                                        {Object.keys(editingSettings[setting.id]?.installments || setting.installments).length}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => adjustInstallments(
                                          setting.id, 
                                          editingSettings[setting.id]?.installments || setting.installments, 
                                          'increase'
                                        )}
                                      >
                                        <ChevronUp size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Mostrar e editar as taxas de cada parcela */}
                              {setting.installments && (
                                <div className="space-y-2 mt-2 border rounded-md p-3 bg-muted/40">
                                  <h4 className="text-sm font-medium mb-2">Taxas por parcela</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(
                                      editingSettings[setting.id]?.installments || setting.installments
                                    ).map(([key, value]) => (
                                      <div
                                        key={key}
                                        className="bg-background p-2 rounded border"
                                      >
                                        <label
                                          htmlFor={`installment-rate-${key}-${setting.id}`}
                                          className="block text-xs mb-1"
                                        >
                                          {key}x:
                                        </label>
                                        <div className="flex items-center">
                                          <Input
                                            id={`installment-rate-${key}-${setting.id}`}
                                            type="number"
                                            className="h-7 text-sm"
                                            value={
                                              editingSettings[setting.id]?.installments?.[key] !== undefined
                                                ? editingSettings[setting.id].installments[key]
                                                : value
                                            }
                                            onChange={(e) => {
                                              const newRate = parseFloat(
                                                e.target.value
                                              );
                                              if (!isNaN(newRate)) {
                                                // Get current installments from editing state or original setting
                                                const currentInstallments = 
                                                  editingSettings[setting.id]?.installments || 
                                                  { ...setting.installments };
                                                
                                                // Update the rate for this installment
                                                const updatedInstallments = {
                                                  ...currentInstallments,
                                                  [key]: newRate,
                                                };
                                                
                                                // If this is the first installment, also update the fee
                                                const updatedValues: any = {
                                                  installments: updatedInstallments
                                                };
                                                
                                                if (key === "1") {
                                                  updatedValues.fee = newRate;
                                                }
                                                
                                                // Update editing state with both installments and potentially fee
                                                setEditingSettings(prev => ({
                                                  ...prev,
                                                  [setting.id]: {
                                                    ...prev[setting.id],
                                                    ...updatedValues
                                                  }
                                                }));
                                              }
                                            }}
                                          />
                                          <span className="ml-1 text-xs">%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end pt-2">
                                <Button
                                  onClick={() => {
                                    // Prepare the data to update
                                    const dataToUpdate = {
                                      name: editingSettings[setting.id]?.name || setting.name,
                                      fee: editingSettings[setting.id]?.fee || setting.fee,
                                      installments: editingSettings[setting.id]?.installments || setting.installments,
                                    };
                                    
                                    // If we have installments, make sure the fee is set to the first installment rate
                                    if (dataToUpdate.installments && Object.keys(dataToUpdate.installments).length > 0) {
                                      dataToUpdate.fee = dataToUpdate.installments["1"] || dataToUpdate.fee;
                                    }
                                    
                                    handleUpdate(setting.id, dataToUpdate);
                                  }}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Confirmar Alterações
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2">
                              {/* View Mode */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {!setting.installments && (
                                  <div className="bg-muted/30 p-2 rounded">
                                    <p className="text-sm text-muted-foreground">Taxa:</p>
                                    <p className="font-medium">{setting.fee}%</p>
                                  </div>
                                )}
                                
                                {setting.installments && (
                                  <>
                                    <div className="bg-muted/30 p-2 rounded">
                                      <p className="text-sm text-muted-foreground">Parcelas:</p>
                                      <p className="font-medium">{Object.keys(setting.installments).length}x</p>
                                    </div>
                                    <div className="bg-muted/30 p-2 rounded">
                                      <p className="text-sm text-muted-foreground">Taxa (1x):</p>
                                      <p className="font-medium">{setting.fee}%</p>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              {setting.installments && Object.keys(setting.installments).length > 1 && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground mb-1">Taxas por parcela:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(setting.installments).map(([key, value]) => (
                                      <Badge key={key} variant="outline" className="bg-background">
                                        {key}x: {value}%
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Não há configurações de pagamento cadastradas.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </details>
        </div>
      </div>
    </div>
  );
}
