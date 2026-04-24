"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ResourceInput } from "../schemas/resource.schema";
import { resourcesService } from "../services/resources.service";

const QUERY_KEY = ["resources"] as const;

/** Max size for direct (single-request) upload: 100 MB */
const MAX_DIRECT_BYTES = 100 * 1024 * 1024;

export function useResources(lessonId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, { lessonId }],
    queryFn: () => resourcesService.getAll(lessonId),
    enabled: !!lessonId,
  });
}

export function useResource(lessonId: string, id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, lessonId, id],
    queryFn: () => resourcesService.getById(lessonId, id),
    enabled: !!lessonId && !!id,
  });
}

export function useCreateResource(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ResourceInput) => resourcesService.create(lessonId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { lessonId }] });
      toast.success("Recurso agregado correctamente.");
    },
    onError: () => toast.error("Error al agregar el recurso."),
  });
}

export function useUpdateResource(lessonId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ResourceInput>) =>
      resourcesService.update(lessonId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { lessonId }] });
      toast.success("Recurso actualizado.");
    },
    onError: () => toast.error("Error al actualizar el recurso."),
  });
}

export function useDeleteResource(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourcesService.delete(lessonId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, { lessonId }] });
      toast.success("Recurso eliminado.");
    },
    onError: () => toast.error("Error al eliminar el recurso."),
  });
}

export interface UploadResourceArgs {
  file: File;
  title: string;
  resource_type: "MAIN" | "SECONDARY";
  resource_format: "VIDEO" | "PDF" | "DOCUMENT" | "LINK" | "IMAGE";
  order_index: number;
}

/**
 * Handles both direct upload (≤ 100 MB) and resumable session upload (> 100 MB).
 * Returns { upload, progress, isPending }.
 */
export function useUploadResource(lessonId: string) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isPending, setIsPending] = useState(false);

  async function upload(args: UploadResourceArgs) {
    setIsPending(true);
    setProgress(0);
    try {
      if (args.file.size <= MAX_DIRECT_BYTES) {
        // ── Direct upload ───────────────────────────────────────────────────
        const formData = new FormData();
        formData.append("file", args.file);
        formData.append("title", args.title);
        formData.append("resource_type", args.resource_type);
        formData.append("resource_format", args.resource_format);
        formData.append("order_index", String(args.order_index));
        const resource = await resourcesService.uploadDirect(
          lessonId,
          formData,
          setProgress,
        );
        qc.invalidateQueries({ queryKey: [...QUERY_KEY, { lessonId }] });
        toast.success("Archivo subido y recurso creado correctamente.");
        return resource;
      } else {
        // ── Resumable session upload ────────────────────────────────────────
        // Step 1: request session
        const session = await resourcesService.requestUploadSession(lessonId, {
          file_name: args.file.name,
          mime_type: args.file.type || "application/octet-stream",
          title: args.title,
          resource_type: args.resource_type,
          resource_format: args.resource_format,
          order_index: args.order_index,
        });
        setProgress(10);

        // Step 2: PUT bytes directly to Drive
        const driveFileId = await resourcesService.putFileToDrive(
          session.upload_url,
          args.file,
          (pct) => setProgress(10 + Math.round(pct * 0.85)),
        );
        setProgress(95);

        // Step 3: confirm
        const resource = await resourcesService.confirmUpload(lessonId, {
          resource_id: session.resource_id,
          drive_file_id: driveFileId,
        });
        setProgress(100);
        qc.invalidateQueries({ queryKey: [...QUERY_KEY, { lessonId }] });
        toast.success("Archivo grande subido y recurso creado correctamente.");
        return resource;
      }
    } catch {
      toast.error("Error al subir el archivo.");
      throw new Error("Upload failed");
    } finally {
      setIsPending(false);
    }
  }

  return { upload, progress, isPending };
}
