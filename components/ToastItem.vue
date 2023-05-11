<template>
	<div 
		class="toast-content"
		:class="[type]"
	>
		<div class="content-text">
			<span v-if="type === 'info'" class="material-icons-outlined icon">info</span>
			<span v-else-if="type === 'success'" class="material-icons-outlined icon">check_circle_outline</span>
			<span v-else-if="type === 'error'" class="material-icons-outlined icon">report</span>
			<span v-else-if="type === 'warn'" class="material-icons-outlined icon">report_problem</span>

			<span class="name">{{ name }}</span>
		</div>
		<span class="material-icons-outlined close" @click="$emit('hideToast', index)">close</span>
	</div>
</template>

<script>
export default {
	name: 'ToastItem',
	emits: ['hideToast'],
	props: {
		index: {
			type: Number
		},
		type: {
			type: String,
			default: 'info'
		},
		name: {
			type: String,
		},
		timeout: {
			type: Number,
		}
	},
	methods: {
		hideWithDelay() {
			setTimeout(() => {
				this.$emit('hideToast');
			}, this.timeout);
		},
	},
	mounted() {
		this.hideWithDelay();
	}
}
</script>

<style scoped>

.toast-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	min-height: 50px;
	margin-top: 16px;
	padding: 16px;
	color: #fff;
	border-radius: 4px;
	background: #000;
	box-shadow: 10px 9px 16px rgba(0, 0, 0, 0.07);
}
.toast-content.info {
	background: #050711;
}
.toast-content.success {
	background: #2eb332;
}
.toast-content.warn {
	background: #e47d00;
}
.toast-content.error {
	background: #d32545;
}

.content-text {
	display: flex;
	align-items: center;
	margin-right: 16px;
}
.icon {
	margin-right: 8px;
}
.close {
	font-size: 18px;
	cursor: pointer;
}
</style>