"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { certificatesService } from "../services/certificates.service";
import type { Certificate } from "@/types";

const QUERY_KEY = ["certificates"] as const;

// ── Admin: all certificates ───────────────────────────────────────────────────
export function useCertificates(skip = 0, limit = 50) {
  return useQuery({
    queryKey: [...QUERY_KEY, { skip, limit }],
    queryFn: () => certificatesService.getAll(skip, limit),
  });
}

// ── ActiveUser: own certificates ──────────────────────────────────────────────
export function useMyCertificates() {
  return useQuery({
    queryKey: [...QUERY_KEY, "me"],
    queryFn: () => certificatesService.getMyCertificates(),
  });
}

// ── Public: verify certificate ────────────────────────────────────────────────
export function useVerifyCertificate() {
  return useMutation({
    mutationFn: (code: string) => certificatesService.verify(code),
    onError: () => toast.error("Certificado no encontrado."),
  });
}

// ── Admin: Mutations ──────────────────────────────────────────────────────────
export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Certificate>) => certificatesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Certificado creado con éxito.");
    },
    onError: () => toast.error("Error al crear el certificado."),
  });
}

export function useUpdateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Certificate> }) =>
      certificatesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Certificado actualizado con éxito.");
    },
    onError: () => toast.error("Error al actualizar el certificado."),
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificatesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Certificado eliminado.");
    },
    onError: () => toast.error("Error al eliminar el certificado."),
  });
}

export function useUploadCertificatePdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      certificatesService.uploadPdf(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("PDF subido correctamente.");
    },
    onError: () => toast.error("Error al subir el PDF del certificado."),
  });
}

export function useCertificate(id?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id],
    queryFn: () => certificatesService.getById(id!),
    enabled: !!id,
  });
}
