<template>
	<transition name="toast">
		<div v-if="messages.length > 0" class="toast">
			<transition-group name="toast" class="messages-list" tag="div">
				<ToastItem
					v-for="(message, index) in messages"
					:key="message.id"
					:index="index"
					:type="message.type"
					:name="message.name"
					:timeout="timeout"
					@hideToast="hideToast(index)"
				/>
			</transition-group>
		</div>
	</transition>
</template>

<script>

export default {
	name: 'Toast',
	props: {
		messages: {
			type: Array,
			default: () => {
				return []
			}
		},
		timeout: {
			type: Number,
			default: 3000
		}
	},
	methods: {
		hideToast(index) {
			if ( this.messages.length ) {
				this.messages.splice(index, 1);
			}
		},
	},
	mounted() {
		this.hideToast();
	},
};
</script>

<style scoped>
.toast {
	position: fixed;
	bottom: 20px;
	right: 20px;
	z-index: 1000;
}
.messages-list {
	display: flex;
	flex-direction: column-reverse;
}

.toast-enter-from {
	transform: translateX(400px);
	opacity: 0;
}
.toast-enter-to {
	transform: translateX(0);
	opacity: 1;
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
.toast-move {
	transition: transform .4s ease;
}


@media only screen and (max-width: 480px) {
	.toast {
		width: 90%;
	}
	.toast-enter-from {
		transform: translateY(400px);
		opacity: 0;
	}
	.toast-enter-to {
		transform: translateY(0);
		opacity: 1;
	}
	.toast-leave-to {
		transform: translateY(400px);
	}
}
</style>