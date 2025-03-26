import { create } from "zustand";
import { getSettings, Setting } from "@/services/settingsService";

interface PaymentSettingsState {
  settings: Setting[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  getSettingByName: (name: string) => Setting | undefined;
  getFeeByMethod: (method: string, installments?: number) => number;
}

export const usePaymentSettingsStore = create<PaymentSettingsState>(
  (set, get) => ({
    settings: [],
    isLoading: false,
    error: null,

    fetchSettings: async () => {
      set({ isLoading: true, error: null });
      try {
        const settings = await getSettings();
        set({ settings, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
        console.error("Error fetching payment settings:", error);
      }
    },

    getSettingByName: (name: string) => {
      return get().settings.find((setting) => setting.name === name);
    },

    getFeeByMethod: (method: string, installments: number = 1) => {
      const { settings } = get();

      // Find the corresponding setting based on payment method
      let settingName = "";

      if (method === "credito") {
        settingName = "Cartão de Crédito";
      } else if (method === "debito") {
        settingName = "Cartão de Débito";
      } else if (method === "link") {
        settingName = "Link";
      } else {
        return 0; // Default to no fee for other methods
      }

      const setting = settings.find((s) => s.name === settingName);

      if (!setting) return 0;

      // For methods with installments, check the installments object
      if (method === "credito" || method === "link") {
        if (setting.installments && setting.installments[installments]) {
          return Number(setting.installments[installments]);
        }
        // Fallback to base fee if installment not found
        return setting.fee;
      }

      // For debit and other methods
      return setting.fee;
    },
  })
);
