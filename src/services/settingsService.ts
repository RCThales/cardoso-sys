
// settingsService.tsx
import { supabase } from "@/integrations/supabase/client";

export interface Setting {
  id?: number;
  name: string;
  fee: number;
  installments?: Record<string, any> | null;
  installmentRates?: string[] | null;
}

export const getSettings = async (): Promise<Setting[]> => {
  const { data, error } = await supabase.from("settings_pagamentos").select("*");
  if (error) throw new Error("Error fetching settings: " + error.message);
  return data;
};

export const updateSetting = async (id: number, setting: Partial<Setting>) => {
  const { error } = await supabase
    .from("settings_pagamentos")
    .update(setting)
    .eq("id", id);
  if (error) throw new Error("Error updating setting: " + error.message);
};

export const addSetting = async (setting: Setting) => {
  const { installments, installmentRates, ...restSetting } = setting;

  // If there are installments, format them properly and set fee to the first installment rate
  const settingData = {
    ...restSetting,
    fee: installments && installmentRates && installmentRates.length > 0 
      ? parseFloat(installmentRates[0] as string) 
      : setting.fee,
    installments: installments 
      ? installmentRates?.reduce((acc, rate, index) => {
          acc[index + 1] = parseFloat(rate as string);
          return acc;
        }, {})
      : null,
  };

  const { error } = await supabase.from("settings_pagamentos").insert([settingData]);
  if (error) throw new Error("Error adding setting: " + error.message);
};

export const deleteSetting = async (id: number) => {
  const { error } = await supabase.from("settings_pagamentos").delete().eq("id", id);
  if (error) throw new Error("Error deleting setting: " + error.message);
};

export const getSettingByName = async (
  name: string
): Promise<Setting | null> => {
  const { data, error } = await supabase
    .from("settings_pagamentos")
    .select("*")
    .eq("name", name)
    .single();
  if (error && error.code !== "PGRST116")
    throw new Error("Error fetching setting: " + error.message);
  return data || null;
};
