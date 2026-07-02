import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filesService } from "../services/files.service";
import { toast } from "sonner";
import type { DriveFile } from "@/types";

const QUERY_KEY = ["files"];

export function useFiles() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: filesService.getAll,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      folderId,
      onProgress,
    }: {
      file: File;
      folderId?: string;
      onProgress?: (percent: number) => void;
    }) => filesService.upload(file, folderId, onProgress),
    onSuccess: (newFile) => {
      // Optimistic update
      qc.setQueryData<DriveFile[]>(QUERY_KEY, (old) => {
        if (!Array.isArray(old)) return [newFile];
        return [newFile, ...old];
      });
      // Also invalidate to be perfectly in sync
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`"${newFile.name}" subido correctamente.`);
    },
    onError: () => {
      toast.error("Error al subir el archivo.");
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesService.delete(id),
    onSuccess: (_, id) => {
      // Optimistic delete
      qc.setQueryData<DriveFile[]>(QUERY_KEY, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((f) => f.id !== id);
      });
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Archivo eliminado.");
    },
    onError: () => {
      toast.error("Error al eliminar el archivo.");
    },
  });
}
