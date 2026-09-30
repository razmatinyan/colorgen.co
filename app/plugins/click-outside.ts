import type { DirectiveBinding } from 'vue'

type ClickOutsideHandler = (event: Event, element: HTMLElement) => void
type ClickOutsideElement = HTMLElement & {
  clickOutsideEvent?: (event: Event) => void
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(
      element: ClickOutsideElement,
      binding: DirectiveBinding<ClickOutsideHandler>,
    ) {
      element.clickOutsideEvent = (event: Event) => {
        const target = event.target

        if (target instanceof Node && element !== target && !element.contains(target)) {
          binding.value(event, element)
        }
      }

      document.body.addEventListener('click', element.clickOutsideEvent)
    },
    unmounted(element: ClickOutsideElement) {
      if (element.clickOutsideEvent) {
        document.body.removeEventListener('click', element.clickOutsideEvent)
      }
    },
  })
})
