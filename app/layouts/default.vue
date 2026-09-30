<template>

    <transition name="loader">
        <Loader v-if="loader" />
    </transition>

    <div class="main">
        <Header />

        <div class="cg-content">
            <slot />
        </div>
    </div>

    <Footer />
    
</template>

<script setup>
let loader = ref(true);

onMounted(() => {
    loader.value = false
});
</script>

<style scoped>
.loader-enter-from {
	opacity: 0;
    visibility: hidden;
}
.loader-enter-to {
	opacity: 1;
    visibility: visible;
}
.loader-enter-active {
	transition: all .2s cubic-bezier(.7, 0, .3, 1);
}
.loader-leave-active {
	transition: all .2s cubic-bezier(.7, 0, .3, 1);
}
.loader-leave-to {
	opacity: 0;
    visibility: hidden;
}
</style>