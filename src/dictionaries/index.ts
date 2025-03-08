import { Locale } from "@/store/useLocaleStore";
import en, { DictionaryKey, DictionaryType } from "./en";
import fr from "./fr";

export type { DictionaryKey, DictionaryType };

export const dictionaries: Record<Locale, DictionaryType> = {
  en,
  fr,
};

export function getDictionary(locale: Locale): DictionaryType {
  return dictionaries[locale];
}
