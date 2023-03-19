<template>
    <div id="error" class="cg-content">
        <Header />
        <img class="image" src="@/assets/404.svg" alt="404">
        <NuxtLink to="/" class="home-link btn btn-blue btn-medium">Go Back Home</NuxtLink>
    </div>
</template>

<script setup>
defineProps(['error']);
</script>

<style scoped>
.cg-content {
    padding-top: 140px;
    padding-bottom: 80px;
}
.image {
    max-width: 800px;
    margin: 0 auto 30px auto;
}
.home-link {
    max-width: 200px;
    margin: 0 auto;
}
</style>