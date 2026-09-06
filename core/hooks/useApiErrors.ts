import { useEffect } from "react";
import { toast } from "sonner-native";
import { getErrorMessage } from "@core/errors";

/**
 * Hook reutilizable que observa los errores de las queries de una pantalla
 * y muestra un toast legible por cada error nuevo.
 *
 * Uso:
 *   const { error: detailError } = useGetDetail(...);
 *   useApiErrors([detailError]);
 */
export function useApiErrors(errors: unknown[]) {
  const errorKey = errors
    .map((e) => (e ? getErrorMessage(e) : ""))
    .join("|");

  useEffect(() => {
    errors.forEach((error) => {
      if (error) {
        toast.error(getErrorMessage(error));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorKey]);
}