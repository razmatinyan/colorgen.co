<template>
	<transition name="overlay" @before-leave="showContent = false" @after-enter="showContent = true">
		<div v-if="showModal" class="modal-overlay" @click="showContent = false">
			<transition name="modal" @after-leave="showModal = false">
				<div 
					v-if="showContent"
					class="modal"
					:style="{
						'max-width': width + 'px',
					}"
					@click.stop
				>
					<div class="modal-header">
						<h2 class="modal-title">{{ modalTitle }}</h2>
					</div>

					<div class="modal-content">
						<div class="content" v-if="$slots.content">
							<slot name="content"></slot>
						</div>
						<div class="buttons" v-if="$slots.buttons">
							<slot name="buttons"></slot>
						</div>
					</div>

					<div class="close" @click="showContent = false">
						<span class="material-icons-outlined close-btn">close</span>
					</div>
				</div>
			</transition>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'Modal',
	props: {
		modalTitle: {
			type: String,
			default: 'Information'
		},
		width: {
			type: Number,
			default: 600
		},
	},
	data() {
		return {
			showModal: false,
			showContent: false,
		}
	},
}
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 20px;
	background-color: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(15px);
	z-index: 1001;
}
.modal {
	position: relative;
	width: 100%;
	background-color: #fff;
	border-radius: 10px;
	box-shadow: 0 0 16px 4px rgba(0, 0, 0, .1);
}
.modal-header {
	padding: 15px 30px;
	box-shadow: rgba(0, 0, 0, 0.1) 0 1px;
}
.modal-header > .modal-title {
	margin-bottom: 0;
	font-size: 18px;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.modal-content {
	padding: 30px;
	overflow-y: auto;
}
.modal-content > .buttons {
	margin-top: 30px;
}
.close {
	position: absolute;
	top: 10px;
	right: 11px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	width: 28px;
	height: 28px;
	border-radius: 5px;
	background: transparent;
	transition: background var(--time-02) ease;
}
.close:hover {
	background: rgb(0 0 0 / 10%);
}
.close > .close-btn {

}

.overlay-enter-from,
.overlay-leave-to {
	opacity: 0;
}
.overlay-enter-to {
	opacity: 1;
}
.overlay-enter-active,
.overlay-leave-active {
	transition: all .2s ease;
}

.modal-enter-from,
.modal-leave-to {
	transform: scale(0.9);
	opacity: 0
}
.modal-enter-to {
	transform: scale(1);
	opacity: 1;
}
.modal-enter-active,
.modal-leave-active {
	transition: all .2s ease;
}

@media only screen and (max-width: 480px) {
	.modal-header > .modal-title {
		font-size: 16px;
		text-align: left;
	}
}
</style>
