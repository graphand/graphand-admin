import { useTranslations } from "next-intl";

export const useTranslation = (...args: Parameters<typeof useTranslations>) => {
  const t = useTranslations(...args);
  return {
    t,
  };
};
