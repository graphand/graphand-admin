import { useState, useEffect } from "react";
import client from "@/lib/graphand-client";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook pour récupérer les dernières conditions d'utilisation
 * @returns Un objet contenant les dernières conditions, le statut de chargement, l'erreur éventuelle et une fonction pour refetch
 */
export function useLatestTerms() {
  const {
    data: terms,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["latest-terms"],
    queryFn: async () => {
      const latestTerms = await client.model("terms").get({
        sort: { _createdAt: -1 },
        limit: 1,
      });
      return latestTerms;
    },
  });

  const termsId = terms?._id || null;

  return {
    terms,
    termsId,
    isLoading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    refetch,
  };
}
