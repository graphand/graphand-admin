import client from "@/lib/graphand-client";
import { useEffect, useState } from "react";

export function useLogged() {
  const [logged, setLogged] = useState(!!client.options.accessToken);

  useEffect(() => {
    const unsub = client.subscribeOptions((options) => {
      if (options.accessToken) {
        setLogged(true);
      } else {
        setLogged(false);
      }
    });

    return unsub;
  }, []);

  return logged;
}
