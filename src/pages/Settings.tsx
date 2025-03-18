// Settings.tsx
import { useEffect, useState } from "react";
import {
  getSettings,
  updateSetting,
  addSetting,
  deleteSetting,
} from "../services/settingsService";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Trash2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [newSetting, setNewSetting] = useState({
    name: "",
    fee: 0,
    installments: null,
    installmentRates: [],
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState<{
    [key: number]: { name: string; fee: number; installments?: any };
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
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao atualizar",
        description: "Houve um erro ao atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async () => {
    if (!newSetting.name.trim()) return;

    // If installments are set, make sure we have valid rate values
    let installmentsToAdd = null;
    let installmentRatesToAdd = [];
    
    if (newSetting.installments && newSetting.installments > 0) {
      installmentsToAdd = newSetting.installments;
      installmentRatesToAdd = newSetting.installmentRates.length > 0 
        ? newSetting.installmentRates
        : Array(parseInt(newSetting.installments)).fill(newSetting.fee); // Default to using fee for all installments
    }

    const settingToAdd = {
      ...newSetting,
      installments: installmentsToAdd,
      installmentRates: installmentRatesToAdd,
      // If using installments, the fee should be the rate of the first installment
      fee: installmentsToAdd ? 
        (installmentRatesToAdd.length > 0 ? parseFloat(installmentRatesToAdd[0]) : newSetting.fee) : 
        newSetting.fee,
    };

    try {
      await addSetting(settingToAdd);
      setNewSetting({
        name: "",
        fee: 0,
        installments: null,
        installmentRates: [],
      });
      fetchSettings();
      toast({
        title: "Configuração adicionada",
        description: "A configuração foi adicionada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao adicionar configuração",
        description: "Houve um erro ao adicionar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSetting(id);
      fetchSettings();
      toast({
        title: "Configuração deletada",
        description: "A configuração foi deletada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao deletar",
        description: "Houve um erro ao deletar a configuração.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="h-full ">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {" "}
          <h2 className="font-bold text-2xl hover:text-[1.6rem] transition-all">
            Tema do Aplicativo
          </h2>
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Seção Pagamentos */}
          <details className="cursor-pointer">
            <summary className="font-bold text-2xl hover:text-[1.6rem] transition-all">
              Pagamentos
            </summary>
            <Card>
              <div className="bg-background dark:bg-gray-800 p-4 rounded-lg">
                <CardHeader>
                  <CardTitle>Adicione um novo tipo de pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 w-full ">
                  <div className="flex flex-row gap-2 flex-wrap items-center w-full">
                    <div className="w-full">
                      <label htmlFor="payment-type" className="block">
                        Tipo de pagamento
                      </label>
                      <Input
                        id="payment-type"
                        type="text"
                        className="min-w-[200px]"
                        placeholder="Tipo de pagamento"
                        value={newSetting.name}
                        onChange={(e) =>
                          setNewSetting({ ...newSetting, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex-1">
                      <label htmlFor="installments" className="block">
                        Parcelas
                      </label>
                      <Input
                        id="installments"
                        type="number"
                        placeholder="Parcelas"
                        value={newSetting.installments ?? ""}
                        className="min-w-[100px]"
                        onChange={(e) => {
                          const installments = parseInt(e.target.value);
                          setNewSetting({
                            ...newSetting,
                            installments: isNaN(installments)
                              ? null
                              : installments,
                            installmentRates: installments
                              ? Array(installments).fill("")
                              : [],
                          });
                        }}
                      />
                    </div>

                    {/* Show fee input only if no installments */}
                    {(!newSetting.installments || newSetting.installments <= 0) && (
                      <div className="w-full">
                        <label htmlFor="payment-fee" className="block">
                          Valor
                        </label>
                        <Input
                          id="payment-fee"
                          type="number"
                          className="min-w-[200px]"
                          placeholder="Valor"
                          value={newSetting.fee}
                          onChange={(e) =>
                            setNewSetting({
                              ...newSetting,
                              fee: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Show installment rates inputs if installments are set */}
                    {newSetting.installments > 0 && (
                      <div className="space-y-2 mt-4 w-full">
                        <label className="block">Taxa por parcela:</label>
                        {Array.from({ length: newSetting.installments }).map((_, index) => (
                          <div key={index} className="flex gap-2">
                            <label
                              htmlFor={`installment-rate-${index}`}
                              className="block"
                            >
                              Parcela {index + 1}:
                            </label>
                            <Input
                              id={`installment-rate-${index}`}
                              className="w-full"
                              type="number"
                              placeholder={`Taxa ${index + 1}`}
                              value={newSetting.installmentRates[index] || ""}
                              onChange={(e) => {
                                const updatedRates = [...newSetting.installmentRates];
                                updatedRates[index] = e.target.value;
                                setNewSetting({
                                  ...newSetting,
                                  installmentRates: updatedRates,
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <Button onClick={handleAdd} className="mt-4">Adicionar</Button>
                  </div>
                </CardContent>
              </div>
              {/* Lista de configurações já adicionadas */}
              <CardHeader>
                <CardTitle>Lista de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.length > 0 ? (
                    <div className="space-y-4">
                      {settings.map((setting) => (
                        <details
                          key={setting.id + "details"}
                          className="cursor-pointer"
                        >
                          <summary>{setting.name}</summary>
                          <div
                            key={setting.id}
                            className="flex justify-between items-center border-b py-4 "
                          >
                            <div className="flex-col w-full">
                              <div className="flex gap-4 w-full flex-wrap">
                                {/* Nome */}
                                <div className="w-full">
                                  <label
                                    htmlFor={`setting-name-${setting.id}`}
                                    className="block"
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
                                      className="block"
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
                                  <label
                                    htmlFor={`installments-${setting.id}`}
                                    className="block"
                                  >
                                    Número de Parcelas
                                  </label>
                                  <Input
                                    id={`installments-${setting.id}`}
                                    type="number"
                                    value={
                                      Object.keys(setting.installments).length
                                    }
                                    onChange={(e) => {
                                      const newInstallments = parseInt(
                                        e.target.value
                                      );
                                      if (!isNaN(newInstallments) && newInstallments > 0) {
                                        // Create a new object with the number of installments
                                        const updatedInstallments = {};
                                        
                                        // Keep existing rates where possible
                                        for (let i = 1; i <= newInstallments; i++) {
                                          updatedInstallments[i] = setting.installments[i] || 0;
                                        }
                                        
                                        handleChange(
                                          setting.id,
                                          "installments",
                                          updatedInstallments
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              )}

                              {/* Mostrar e editar as taxas de cada parcela */}
                              {setting.installments && (
                                <ul className="space-y-2 mt-2">
                                  {Object.entries(setting.installments).map(
                                    ([key, value]) => (
                                      <li
                                        key={key}
                                        className="flex justify-between items-center"
                                      >
                                        <label
                                          htmlFor={`installment-rate-${key}-${setting.id}`}
                                          className="block"
                                        >
                                          Parcela {key}:
                                        </label>
                                        <Input
                                          id={`installment-rate-${key}-${setting.id}`}
                                          type="number"
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
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>

                            {/* Ações */}
                            <div className="flex  gap-2 translate-y-[12px]">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-500 hover:text-blue-800 hover:bg-blue-300 dark:hover:bg-blue-800 dark:hover:text-white"
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
                              >
                                <Check className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/80 dark:hover:text-white"
                                onClick={() => handleDelete(setting.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </details>
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
