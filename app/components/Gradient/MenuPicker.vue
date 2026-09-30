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
				@input="changeColorValue(inputText)"
				@blur="emit('done')"
			>

			<div class="chosen-color">
				<ColorPicker
					:model-value="newValue"
					:label="label"
					@update:model-value="changeColorValue"
					@done="emit('done')"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
const emit = defineEmits(['color-change', 'update:item', 'done']);
const props = defineProps({
	label: {
		type: String
	},
	item: {
		type: String,
	}
})

const newValue = toRef(props, 'item');
const inputText = ref(newValue.value);

watch(newValue, (value) => {
	inputText.value = value
});

function changeColorValue(color) {
	emit('update:item', color);
	emit('color-change', color);
}

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

.chosen-color :deep(.color-picker-trigger) {
	width: 30px;
	height: 30px;
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
