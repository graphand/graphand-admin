"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export function LanguageSelector() {
  const router = useRouter();
  const cookies = useCookies();
  const locale = useLocale();
  const [selectedLanguage, setSelectedLanguage] = useState(locale);

  useEffect(() => {
    if (selectedLanguage !== locale) {
      handleLanguageChange(selectedLanguage);
    }
  }, [selectedLanguage]);

  const handleLanguageChange = (value: string) => {
    // Store the selected language in a cookie
    cookies.set("NEXT_LOCALE", value, { path: "/" });

    router.refresh();
  };

  return (
    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
