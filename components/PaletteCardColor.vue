<template>
	<div class="color"
		v-bind="$attrs"
		@click="handleCopy('#' + color)"
	>
		<span class="code" v-html="!showCheck ? '#' + color : checkIcon"></span>
	</div>
</template>

<script setup>
const emit = defineEmits(['onCopy']);
const props = defineProps({
	color: {
		type: String
	},
});

const showCheck = ref(false);
const checkIcon = '<span class="material-icons-outlined">done</span>';

function handleCopy(color) {
	emit('onCopy', color);
	showCheck.value = true;
	setTimeout(() => {
		showCheck.value = false;
	}, 2000);
}
</script>

<style scoped>
.color {
	position: relative;
	flex-basis: 1px;
	flex-grow: 1;
	box-shadow: inset rgba(0, 0, 0, 0.05) 0 1px, inset rgba(0, 0, 0, 0.05) 0 -1px;
	transition: all var(--time-01) ease;
	overflow: hidden;
	cursor: pointer;
}
.color:hover {
	flex-basis: 90px;
}
.code {
	position: absolute;
	top: 50%;
	display: block;
	width: 100%;
	text-align: center;
	text-transform: uppercase;
	font-weight: 500;
	opacity: 0;
	transform: translateY(-50%);
	transition: all var(--time-01) ease;
	z-index: 3;
	user-select: none;
}
.color:hover .code {
	opacity: 1;
}
</style>