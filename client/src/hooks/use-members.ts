import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { z } from "zod";
import { type InsertMember } from "@shared/schema";

export function useMembers() {
  return useQuery({
    queryKey: [api.members.list.path],
    queryFn: async () => {
      const res = await fetch(api.members.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return api.members.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMember) => {
      // Coerce contribution to number if it comes as string from form
      const payload = { ...data, contribution: Number(data.contribution) };
      const validated = api.members.create.input.parse(payload);
      
      const res = await fetch(api.members.create.path, {
        method: api.members.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create member");
      }
      return api.members.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.members.list.path] }),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertMember>) => {
      const payload = updates.contribution 
        ? { ...updates, contribution: Number(updates.contribution) } 
        : updates;
      const validated = api.members.update.input.parse(payload);
      const url = buildUrl(api.members.update.path, { id });
      
      const res = await fetch(url, {
        method: api.members.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update member");
      return api.members.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.members.list.path] }),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.members.delete.path, { id });
      const res = await fetch(url, { 
        method: api.members.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete member");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.members.list.path] }),
  });
}
