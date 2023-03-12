<template>
    <div id="myiddiv">
        {{ myId }}
    </div>
</template>

<script setup>
const route = useRoute()

const myId = route.params.id;

console.log(route.params.id)
</script>