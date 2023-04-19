<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<style>
.page-left-enter-active,
.page-left-leave-active,
.page-right-enter-active,
.page-right-leave-active {
  transition: all 0.2s;
}
.page-left-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}
.page-left-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}
.page-right-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}
.page-right-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}

/* .page-left-enter-active,
.page-right-enter-active,
.page-left-leave-active,
.page-right-leave-active {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all .3s ease;
}
.page-left-enter-from, .page-right-leave-to {
  transform: translateX(100%);
}
.page-left-leave-to, .page-right-enter-from {
  transform: translateX(-100%);
}
.page-left-enter-to, .page-right-enter-to {
  transform: translateX(0);
} */
</style>