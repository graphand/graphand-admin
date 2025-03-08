"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocaleStore, Locale } from "@/store/useLocaleStore";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/translations";

export function LanguageSelector() {
  const { locale, setLocale } = useLocaleStore();
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation(locale);

  // Ensure hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleLanguageChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="flex items-center">
            <span className="mr-2">🇬🇧</span> EN
          </span>
        </SelectItem>
        <SelectItem value="fr">
          <span className="flex items-center">
            <span className="mr-2">🇫🇷</span> FR
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
