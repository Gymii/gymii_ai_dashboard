import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchData, postData, putData, deleteData } from "../services/api";
import { queryClient } from "../services/queryClient";
import { RawUser } from "./useKPI";

export interface AdminComment {
  id: number;
  user_id: string;
  author_id: number;
  text: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch comments for a specific user
export function useAdminComments(userId?: string) {
  return useQuery<AdminComment[]>({
    queryKey: ["adminComments", userId],
    queryFn: async () => {
      if (!userId) return [];
      return fetchData<AdminComment[]>(`/admin/${userId}/comments`);
    },
    enabled: !!userId,
  });
}

// Add a new comment
export function useAddAdminComment() {
  return useMutation({
    mutationFn: async ({
      userId,
      text,
      mood,
    }: {
      userId: string;
      text: string;
      mood: string | null;
    }) => {
      return postData<AdminComment>(`/admin/${userId}/comments`, {
        text,
        mood,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adminComments", variables.userId],
      });
    },
  });
}

// Update an existing comment
export function useUpdateAdminComment() {
  return useMutation({
    mutationFn: async ({
      commentId,
      text,
      mood,
      userId,
    }: {
      commentId: number;
      text?: string;
      mood?: string | null;
      userId: string;
    }) => {
      return putData<AdminComment>(`/admin/comments/${commentId}`, {
        text,
        mood,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adminComments", variables.userId],
      });
    },
  });
}

// Delete a comment
export function useDeleteAdminComment() {
  return useMutation({
    mutationFn: async ({
      commentId,
      userId,
    }: {
      commentId: number;
      userId: string;
    }) => {
      return deleteData<{ message: string }>(`/admin/comments/${commentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adminComments", variables.userId],
      });
    },
  });
}
