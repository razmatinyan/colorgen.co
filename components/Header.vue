<template>
	<header id="header">
		<nav :class="{ 'show-menu': showMenu }" class="nav paddings">
			<div class="logo-wrapper">
				<NuxtLink to="/">
					<img src="/logo.svg" alt="CG - ColorGen">
				</NuxtLink>
			</div>
			<div class="menu">
				<ul class="menu-list reset">
					<li>
						<NuxtLink to="/" @click="toggleMenu()">Home</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/palette" @click="toggleMenu()">Palette Generator</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/gradient" @click="toggleMenu()">Gradient Palette</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/saved" @click="toggleMenu()">Saved Palettes</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/contact" @click="toggleMenu()">Contact</NuxtLink>
					</li>
				</ul>
			</div>
			<div class="burger-menu">
				<div @click="toggleMenu()" class="burger"></div>
			</div>
			<div @click="toggleMenu()" class="menu-overlay"></div>
		</nav>
	</header>
</template>

<script setup>
let showMenu = ref(false);

function toggleMenu() {
	if ( window.innerWidth <= 769 ) {
		showMenu.value = !showMenu.value;
		document.documentElement.classList.toggle('disable-scroll', showMenu.value);
	}
}
</script>

<style scoped>

.burger-menu {
	position: relative;
	display: none;
	align-items: center;
	justify-content: center;
	max-width: 20px;
	width: 100%;
	height: 30px;
	z-index: 3;
}
.burger {
	position: relative;
	width: 100%;
	height: 3px;
	background: var(--text-black);
	border-radius: 4px;
	transition: transform 75ms cubic-bezier(.55,.055,.675,.19);
}
.burger::before,
.burger::after {
	content: '';
	display: block;
	width: 100%;
	height: 3px;
	position: absolute;
	background: var(--text-black);
	border-radius: 4px;
}
.burger::before {
	top: -8px;
	transition: top 75ms ease .12s,opacity 75ms ease;
}
.burger::after {
	bottom: -8px;
	transition: bottom 75ms ease .12s,transform 75ms cubic-bezier(.55,.055,.675,.19);
}

.show-menu .burger {
	transition-delay: .12s;
	transition-timing-function: cubic-bezier(.215,.61,.355,1);
	transform: rotate(45deg);
}
.show-menu .burger::before {
	top: 0;
	transition: top 75ms ease, opacity 75ms ease .12s;
	opacity: 0;
}
.show-menu .burger::after {
	bottom: 0;
	transition: bottom 75ms ease, transform 75ms cubic-bezier(.215,.61,.355,1) .12s;
	transform: rotate(-90deg);
}

#header {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 70px;
	background: #fff;
	box-shadow: rgba(0, 0, 0, 0.1) 0 1px;
	z-index: 1000;
}
.nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	padding-top: 10px;
	padding-bottom: 10px;
}
.logo-wrapper {
	display: flex;
	align-items: center;
	flex: 1 1 auto;
}
.logo-wrapper > a {
	display: inline-block;
}
.logo-wrapper > a > img {
	max-width: 70px;
	width: 100%;
	user-select: none;
}
.menu {

}
.menu > ul {
	display: flex;
}
.menu > ul > li {
	margin-right: 20px;
}
.menu > ul > li:last-child {
	margin-right: 0;
}
.menu > ul > li > a {
	color: var(--text-black);
	text-decoration: none;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	transition: color .1s;
}
.menu > ul > li > a:hover {
	color: var(--blue);
}
.menu > ul > li > a.router-link-exact-active {
	color: #0066ff;
}

@media only screen and (max-width: 769px) {
	#header {
		height: 56px;
	}
	.nav {
		padding: 8px 20px;
	}
	.logo-wrapper > a > img {
		max-width: 56px;
	}
	.burger-menu {
		display: flex;
	}
	.menu {
		position: fixed;
		top: 0;
		right: -360px;
		bottom: 0;
		height: 100%;
		padding: 80px 0 30px 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow-y: auto;
		overflow-x: hidden;
		width: 300px;
		max-width: 100%;
		background: var(--white);
		opacity: 0;
		visibility: hidden;
		box-shadow: -2px 0 8px rgb(0 0 0 / 20%);
		transition: all .5s cubic-bezier(.7,0,.2,1);
		z-index: 2;
	}
	.show-menu .menu {
		right: 0;
		opacity: 1;
		visibility: visible;
		margin: 0;
	}
	.menu > ul {
		flex-direction: column;
	}
	.menu > ul > li {
		margin-right: 0;
		margin-bottom: 20px;
		text-align: center;
	}
	.menu > ul > li:last-child {
		margin-bottom: 0;
	}
	.menu > ul > li > a {
		font-size: 22px;
	}
	.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		user-select: none;
		transition: all .5s cubic-bezier(.7,0,.2,1);
		z-index: 1;
	}
	.show-menu .menu-overlay {
		opacity: 1;
		visibility: visible;
		pointer-events: all;
	}
}
</style>