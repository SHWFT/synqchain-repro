// Toast utility that wraps Sonner for consistent API
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: sonnerToast.success,
  error: sonnerToast.error,
  info: sonnerToast.info,
  warning: sonnerToast.warning,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  message: sonnerToast.message,
};

export default toast;
