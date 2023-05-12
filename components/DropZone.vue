<template>
	<div
		@dragenter.prevent="toggleActive"
		@dragleave.prevent="toggleActive"
		@dragover.prevent
		@drop.prevent="toggleActive"
		@click="triggerInput"
		:class="{ 'active': active }"
		class="dropzone"
	>
		<div class="in">
			<span>Drag and Drop File</span>
			<span>OR</span>

			<span class="select-btn btn btn-purple btn-width btn-medium btn-flex" v-html="btnText" />

			<input type="file" id="dropzoneFile" class="dropzoneFile" @change="handleChange" />

			<div class="drop-overlay" :class="{ 'drop-active': active }">
				<span class="material-icons-outlined">cloud_upload</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			active: false,
			btnText: 'Select File',
		}
	},
	methods: {
		toggleActive() {
			this.active = !this.active
		},
		triggerInput() {
			document.getElementById('dropzoneFile').click();
		},
		handleChange() {
			this.btnText = '<div class="btn-loader"></div>'
		},
		emptyFiles() {
			document.querySelector('#dropzoneFile').files = new DataTransfer().files
		}
	}
}
</script>

<style scoped>
.dropzone {
	position: relative;
	max-width: 600px;
	width: 100%;
	height: 250px;
	padding: 10px;
	border: 2px dashed #9cb6ff;
	border-radius: 10px;
	background-color: #fff;
	transition: all 0.2s ease;
	cursor: pointer;
	user-select: none;
}
.dropzone:hover,
.dropzone.active {
	border-color: var(--purple);
}
.dropzone > .in {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	row-gap: 16px;
	height: 100%;
	background: rgb(0 20 255 / 8%);
	border-radius: 10px;
}
input {
	display: none;
}
.active-dropzone {
	color: #fff;
	border-color: #fff;
	background-color: var(--purple);
}
.select-btn {
	height: 40px;
	line-height: 39px;
}
.drop-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(101, 99, 255, .9);
	border-radius: 10px;
	transition: all var(--time-02) ease;
	opacity: 0;
	visibility: hidden;
	user-select: none;
	pointer-events: none;
	z-index: 2;
}
.drop-overlay.drop-active {
	opacity: 1;
	visibility: visible;
	user-select: all;
	pointer-events: all;
}
.drop-overlay > span {
	color: #fff;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 70px;
}
</style>