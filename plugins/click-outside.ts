export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.VueApp.directive('click-outside', {
        beforeMount (el: any, binding: any, vnode: any) {
            el.clickOutsideEvent = function (event: Event) {
                if (!(el === event.target || el.contains(event.target))) {
                    vnode.context[binding.expression](event);
                }
            };
            document.body.addEventListener('click', el.clickOutsideEvent);
        },
        unmounted (el: any) {
            document.body.removeEventListener('click', el.clickOutsideEvent);
        }
    });
})