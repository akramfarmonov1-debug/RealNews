import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { StoryWithCategory, StoryWithItems } from "@shared/schema";

// Get all active stories
export function useStories() {
  return useQuery<StoryWithCategory[]>({
    queryKey: ['/api/stories'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get specific story with items
export function useStory(id: string | null) {
  return useQuery<StoryWithItems>({
    queryKey: ['/api/stories', id],
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Admin hooks for managing stories
export function useAdminStories() {
  return useQuery<StoryWithCategory[]>({
    queryKey: ['/api/admin/stories'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/stories', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
    }
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/stories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
    }
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/stories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
    }
  });
}