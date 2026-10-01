import type { ExternalToast } from 'vue-sonner'
import { toast } from 'vue-sonner'

type AppToastType = 'info' | 'success' | 'warning' | 'warn' | 'error'

export function useAppToast() {
  function showToast(
    message: string,
    type: AppToastType = 'info',
    options?: ExternalToast,
  ) {
    if (type === 'success') return toast.success(message, options)
    if (type === 'error') return toast.error(message, options)
    if (type === 'warning' || type === 'warn') return toast.warning(message, options)

    return toast.info(message, options)
  }

  return { showToast }
}
