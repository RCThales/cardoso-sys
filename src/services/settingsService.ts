
// settingsService.tsx
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface Setting {
  id?: number;
  name: string;
  fee: number;
  installments?: Record<string, any> | null;
  installmentRates?: string[] | null;
}

// Type for database operations
interface SettingDB {
  id?: number;
  name: string;
  fee: number;
  installments: Json | null;
}

// Types specifically for insert and update operations based on Supabase schema
type SettingInsert = {
  name: string;
  fee: number;
  installments: Json | null;
}

export const getSettings = async (): Promise<Setting[]> => {
  const { data, error } = await supabase.from("settings_pagamentos").select("*");
  if (error) throw new Error("Error fetching settings: " + error.message);
  
  // Convert from database type to our app type
  return data.map(item => ({
    id: item.id,
    name: item.name,
    fee: item.fee,
    installments: item.installments as Record<string, any> | null,
  }));
};

export const updateSetting = async (id: number, setting: Partial<Setting>) => {
  // Convert to database format
  const dbSetting: Partial<SettingInsert> = {
    name: setting.name,
    fee: setting.fee,
    installments: setting.installments as Json | null,
  };

  const { error } = await supabase
    .from("settings_pagamentos")
    .update(dbSetting)
    .eq("id", id);
  if (error) throw new Error("Error updating setting: " + error.message);
};

export const addSetting = async (setting: Setting) => {
  const { installments, installmentRates, ...restSetting } = setting;

  // If there are installments, format them properly and set fee to the first installment rate
  const installmentsObj = installments 
    ? installmentRates?.reduce((acc, rate, index) => {
        acc[index + 1] = parseFloat(rate as string);
        return acc;
      }, {})
    : null;

  const settingData: SettingInsert = {
    name: restSetting.name,
    fee: installments && installmentRates && installmentRates.length > 0 
      ? parseFloat(installmentRates[0] as string) 
      : setting.fee,
    installments: installmentsObj as Json | null,
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
  
  if (!data) return null;
  
  // Convert from database type to our app type
  return {
    id: data.id,
    name: data.name,
    fee: data.fee,
    installments: data.installments as Record<string, any> | null,
  };
};
