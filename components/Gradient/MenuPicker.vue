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
.menu-color {
	position: relative;
}
.menu-color > .input-label {
	display: block;
	color: var(--text-black);
	font-size: 12px;
	position: absolute;
	top: -8px;
	left: 28px;
	background: #fff;
	z-index: 2;
	user-select: none;
}
.menu-color.menu-custom-color > .input-label {
	left: 48%;
	transform: translateX(-50%);
}
.menu-custom-color .inputs .v-application {
	position: absolute;
	top: 48px;
}
.menu-custom-color .chosen-color {
	position: absolute;
	top: 5px;
	right: 6px;
	width: 30px;
	height: 30px;
	border-radius: 7px;
	box-shadow: 0 0 1px 1px rgba(0,0,0,0.1);
	cursor: pointer;
}


.picker-enter-from,
.picker-leave-to {
	transform: translateY(-30px);
	opacity: 0;
}
.picker-enter-to {
	transform: translateY(0);
	opacity: 1;
}
.picker-enter-active,
.picker-leave-active {
	transition: all .2s ease;
}

.menu-color > .inputs {
	position: relative;
}
.menu-color > .inputs > .custom-color-input {
	max-width: 150px;
	height: 40px;
	line-height: 39px;
}

.menupicker-overlay {
	display: block;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
}

@media only screen and (max-width: 1200px) {
	.menu-custom-color {
		position: initial;
	}
	.menu-custom-color > .inputs {
		position: initial;
	}
	.menu-color > .input-label {
		display: none;
	}
	.menu-color > .inputs > .custom-color-input {
		display: none;
	}

	.menu-custom-color .chosen-color {
		right: auto;
		top: 50%;
		transform: translate(0, -50%);
	}
	.first-color .chosen-color {
		left: 10px;
	}
	.second-color .chosen-color {
		left: 50px;
	}
}
</style>