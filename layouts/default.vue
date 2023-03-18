<template>
    <Loader v-if="loader" />
    <div class="main">
        <Header />

        <div class="cg-content">
            <slot />
        </div>
    </div>
</template>

<script setup>
let loader = ref(true);

onMounted(() => {
    loader.value = false
});
</script>

<style scoped>

</style>