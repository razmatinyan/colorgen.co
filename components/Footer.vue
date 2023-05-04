<template>
	<footer v-if="showFooter" id="footer">
		<div class="container">
			<div class="info">
				<p class="info-text">
					© Created by <a href="http://razmatinyan.com" target="_blank">Raz Matinyan</a>. With love from <a href="https://en.wikipedia.org/wiki/Armenia" target="_blank">Armenia</a> <span class="flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.8 4.95"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><rect class="cls-1" width="8.8" height="1.65"/><rect class="cls-2" y="1.64" width="8.8" height="1.65"/><rect class="cls-3" y="3.29" width="8.8" height="1.66"/></g></g></svg></span>
				</p>
			</div>
			<div class="social">
				<a target="__blank" href="https://github.com/razmatinyan">
					<v-icon icon="mdi-github"></v-icon>
				</a>
				<a target="__blank" href="https://www.instagram.com/raz28m/">
					<v-icon icon="mdi-instagram"></v-icon>
				</a>
			</div>
		</div>
	</footer>
</template>

<script setup>
import { VIcon } from 'vuetify/components/VIcon';

const route = useRoute();
const showFooter = computed(() => {
	return !route.params.palette && !route.params.gradient
})
</script>

<style scoped>
#footer {
	padding: 30px 0;
	margin-top: 50px;
	background: linear-gradient(
		0deg, rgb(189 220 253 / 49%) 0%,
		rgba(255, 255, 255, 0.4990371148) 100%
	)
}
.container {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.info-text {
	font-size: 14px;
}
.info-text > a {
	color: var(--text-black);
	font-weight: 500;
	text-decoration: none;
	transition: color .2s ease;
}
.info-text > a:hover {
	color: var(--blue);
	text-decoration: underline;
}
.info-text > .flag {
	display: inline-block;
	margin-left: 2px;
}
.flag > svg {
	height: 11px;
}
.social {
	display: flex;
	align-items: center;
}
.social > a {
	margin-left: 6px;
}
.social > a:first-child {
	margin-left: 0;
}
.social > a > i {
	transition: color .2s ease;
	color: #000;
}
.social > a:hover > i {
	color: var(--blue);
}
.cls-1{fill:red;}.cls-2{fill:blue;}.cls-3{fill:orange;}


@media only screen and (max-width: 520px) {
	.container {
		flex-direction: column-reverse;
	}
	.info {
		margin-top: 20px;
		text-align: center;
	}
}
</style>