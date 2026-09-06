import { useCallback, useState } from "react";
import { pickBestSource } from "@services/streams";
import { toAppError, getErrorMessage } from "@core/errors";
import { toast } from "sonner-native";
import type { StreamSource, StreamInput } from "@core/types";

interface UseMediaSourceResolverOptions {
  input: StreamInput;
}

export function useMediaSourceResolver({ input }: UseMediaSourceResolverOptions) {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveSource = useCallback(
    async (source: StreamSource, preferredKey?: string): Promise<StreamSource | null> => {
      if (!source) return null;
      setIsResolving(true);
      setError(null);
      try {
        const best = await pickBestSource(input, preferredKey ?? source.key);
        if (!best) {
          throw toAppError(new Error("No se pudo resolver la fuente de video"), "SOURCE_NOT_FOUND");
        }
        return best;
      } catch (e) {
        const message = getErrorMessage(e);
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsResolving(false);
      }
    },
    [input]
  );

  return { resolveSource, isResolving, error };
}