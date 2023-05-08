<template>
	<div id="loader">
		<div class="loader-in">
			<div class="spinner"></div>
		</div>
	</div>
</template>

<style scoped>
#loader {
	position: fixed;
	height: 100%;
	width: 100%;
	background: #fff;
	z-index: 9999;
}
.loader-in {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}
.spinner {
	width: 56px;
	height: 56px;
	display: grid;
	border: 4px solid #0000;
	border-radius: 50%;
	border-right-color: #004dff;
	animation: spinner 1s infinite linear;
}

.spinner::before,
.spinner::after {
	content: "";
	grid-area: 1/1;
	margin: 2px;
	border: inherit;
	border-radius: 50%;
	animation: spinner 2s infinite;
}

.spinner::after {
	margin: 8px;
	animation-duration: 3s;
}

@keyframes spinner {
	100% {
		transform: rotate(1turn);
	}
}
</style>

<script setup>

</script>