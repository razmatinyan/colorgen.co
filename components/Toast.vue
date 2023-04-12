<template>
	<transition name="toast">
		<div v-if="isVisible" class="toast-container">
			<div class="toast" :class="[type]">
				<div class="message-block">
					<span v-if="type === 'success'" class="material-icons-outlined">check_circle_outline</span>
					<span v-else-if="type === 'info'" class="material-icons-outlined">info</span>
					<span v-else-if="type === 'warning'" class="material-icons-outlined">highlight_off</span>
					<span v-else-if="type === 'error'" class="material-icons-outlined">error_outline</span>

					<span class="message"> {{ message }} {{ color }}</span>
				</div>
				<span class="material-icons-outlined close" @click="hide">close</span>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
  setup() {
	const isVisible = ref(false);
	const type = ref('info');
	const message = ref('');
	const color = ref('');

	const show = (msg, toastType, copiedColor) => {

		if ( isVisible.value === true ) {
			setTimeout(() => {
				show(msg, toastType, copiedColor);
			}, 3000);

			clearInterval(() => {
				show(msg, toastType, copiedColor);
			});
		} else {
			message.value = msg;
			type.value = toastType || 'info';
			color.value = copiedColor;
			isVisible.value = true;

			setTimeout(hide, 3000);
		}

	};

	const hide = () => {
		isVisible.value = false;
		type.value = '';
		color.value = '';
		clearInterval(hide);
	};

	return {
		isVisible,
		message,
		type,
		color,
		show,
		hide,
	};
  }
};
</script>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
}

.toast {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background-color: #333;
}

.toast.success {
    background-color: #4caf50;
}
.toast.warning {
    background-color: #f4c20d;
}
.toast.error {
    background-color: #db3236;
}
.toast.info {
    background-color: #2196f3;
}

.message-block {
	display: flex;
	align-items: center;
}
.message-block > span:first-child {
	margin-right: 8px;
}

.message-block {
    margin-right: 16px;
}

.close {
    background-color: transparent;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}

.toast-enter-from {
	transform: translateX(400px);
}
.toast-enter-to {
	transform: translateX(0);
}
.toast-enter-active {
	transition: all .7s cubic-bezier(.7, 0, .3, 1);
}
.toast-leave-active {
	transition: all .7s cubic-bezier(.7, 0, .3, 1);
}
.toast-leave-to {
	transform: translateX(400px);
}
</style>