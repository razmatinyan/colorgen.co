<template>
	<div
		@dragenter.prevent="toggleActive"
		@dragleave.prevent="toggleActive"
		@dragover.prevent
		@drop.prevent="toggleActive"
		:class="{ 'active-dropzone': active }"
		class="dropzone"
	>
		<span>Drag and Drop File</span>
		<span>OR</span>

		<label for="dropzoneFile" class="select-btn btn btn-green btn-width btn-medium btn-flex" v-html="btnText" />

		<input type="file" id="dropzoneFile" class="dropzoneFile" @change="handleChange" />
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
	max-width: 600px;
	width: 100%;
	height: 250px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	row-gap: 16px;
	border: 2px dashed var(--green);
	background-color: #fff;
	transition: 0.3s ease all;
}
input {
	display: none;
}
.active-dropzone {
	color: #fff;
	border-color: #fff;
	background-color: var(--green);
}

.select-btn {
	height: 40px;
	line-height: 39px;
}
</style>