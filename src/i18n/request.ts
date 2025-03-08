import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Read locale from cookie or default to "en"
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  // Import locale messages
  const messages = (await import(`../../public/locales/${locale}.json`))
    .default;

  return {
    locale,
    messages,
  };
});
