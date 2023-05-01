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
    position: fixed !important;
    width: 100%;
    transition: all 0.2s;
}
.page-same-enter-active,
.page-same-leave-active {
    transition: none;
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
</style>