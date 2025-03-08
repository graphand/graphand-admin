import { Locale } from "@/store/useLocaleStore";
import { getDictionary, DictionaryKey } from "@/dictionaries";

export type TranslationKey = DictionaryKey;

export function useTranslation(locale: Locale) {
  const dictionary = getDictionary(locale);

  const translate = (key: DictionaryKey): string => {
    return dictionary[key] || key;
  };

  return { t: translate };
}
