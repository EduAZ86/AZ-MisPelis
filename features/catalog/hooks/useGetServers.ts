import { useQuery } from "@tanstack/react-query";
import { resolveStreams } from "@services/streams";
import { queryKeys } from "./queryKeys";
import type { StreamInput, StreamSource } from "@core/types";

export function useGetServers(input: StreamInput, enabled = true) {
  return useQuery({
    queryKey: queryKeys.servers.list(input),
    queryFn: () => resolveStreams(input),
    enabled: enabled && !!input.id,
    staleTime: 1000 * 60 * 10,
    select: (data) => data as StreamSource[],
  });
}