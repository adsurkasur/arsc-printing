'use client';

import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * M3 Toast / Snackbar wrapper (§5):
 * Enforces spec durations:
 * - success: 4000ms
 * - info: 6000ms
 * - error: Infinity (persists until dismissed)
 */
export const m3Toast = {
  success: (message: string, options?: ExternalToast) =>
    sonnerToast.success(message, { duration: 4000, ...options }),

  info: (message: string, options?: ExternalToast) =>
    sonnerToast.info(message, { duration: 6000, ...options }),

  error: (message: string, options?: ExternalToast) =>
    sonnerToast.error(message, { duration: Infinity, ...options }),

  loading: (message: string, options?: ExternalToast) =>
    sonnerToast.loading(message, { duration: Infinity, ...options }),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};
