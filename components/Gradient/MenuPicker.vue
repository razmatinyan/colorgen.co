<template>
	<div class="menu-item menu-color menu-custom-color">
		<label :for="label + '-' + item" class="input-label">{{ props.label }}</label>
		<div class="inputs">
			<input 
				type="text" 
				class="custom-color-input"
				placeholder="#C3D4EF"
				:id="label + '-' + item"
				v-model="inputText"
				@update:model-value="changeColorValue($event)"
			>

			<span class="chosen-color" @click="show = !show" :style="{ 'background-color': newValue }"></span>

			<transition name="picker">
				<v-app v-if="show">
					<v-color-picker 
						class="color-picker"
						:model-value="newValue"
						:modes="['hex']"
						dot-size="20"
						@update:model-value="changeColorValue($event)"
					></v-color-picker>
				</v-app>
			</transition>
		</div>

		<div 
			class="menupicker-overlay"
			v-if="show"
			@click="show = !show, $emit('done')"
		></div>
	</div>
</template>

<script setup>
const { $chroma } = useNuxtApp();
const emit = defineEmits(['color-change', 'update:item', 'done']);
const props = defineProps({
	label: {
		type: String
	},
	item: {
		type: String,
	}
})

const show = ref(false);
const newValue = toRef(props, 'item');
const inputText = ref(newValue.value);

watch(newValue, (value) => {
	inputText.value = newValue.value
});

function changeColorValue(color) {
	emit('update:item', color);
	emit('color-change', color);
}

function inputListener(e) {
	if ( e.target.value !== '' ) emit('done');
}

onMounted(() => {
	document.querySelector('.custom-color-input').addEventListener('focusout', inputListener)
})
onBeforeUnmount(() => {
	document.querySelector('.custom-color-input').removeEventListener('focusout', inputListener)
})
</script>

<style scoped>
.menupicker-overlay {
	display: block;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
}
</style>