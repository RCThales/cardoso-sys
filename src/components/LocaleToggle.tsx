
import { useState } from "react";
import { Button } from "./ui/button";

export const LocaleToggle = () => {
  const [locale, setLocale] = useState("pt");

  const toggleLocale = () => {
    const newLocale = locale === "pt" ? "en" : "pt";
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="w-14"
    >
      {locale === "pt" ? "EN" : "PT"}
    </Button>
  );
};
