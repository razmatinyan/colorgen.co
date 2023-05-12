<template>
	<header id="header">
		<nav :class="{ 'show-menu': showMenu }" class="nav paddings">
			<div class="logo-wrapper">
				<NuxtLink to="/">
					<img src="/logo.svg" alt="CG - ColorGen" width="70" height="43">
				</NuxtLink>
			</div>
			<div class="menu">
				<ul class="menu-list reset">
					<li class="has-dropdown tools-dropdown__wrapper">
						<span class="link is-droppable">Tools <span class="material-icons-outlined menu-icon">expand_more</span></span>
						<ul class="reset dropdown tools-dropdown">
							<li class="dropdown-li">
								<NuxtLink class="link link-1" to="/palette" @click="toggleMenu()">
									<div class="link-icon">
										<img :src="PaletteSVG" alt="Palette Generator">
									</div>
									<span class="link-text">Palette Generator</span>
								</NuxtLink>
							</li>
							<li class="dropdown-li">
								<NuxtLink class="link link-2" to="/gradient" @click="toggleMenu()">
									<div class="link-icon">
										<img :src="GradientSVG" alt="Gradient Palette">
									</div>
									<span class="link-text">Gradient Palette</span>
								</NuxtLink>
							</li>
							<li class="dropdown-li">
								<NuxtLink class="link link-3" to="/image-colors" @click="toggleMenu()">
									<div class="link-icon">
										<img :src="ImgPickerSVG" alt="Image Colors">
									</div>
									<span class="link-text">Image Colors</span>
								</NuxtLink>
							</li>
						</ul>
					</li>
					<li>
						<NuxtLink class="link" to="/saved" @click="toggleMenu()">Saved Palettes</NuxtLink>
					</li>
					<li>
						<NuxtLink class="link" to="/contact" @click="toggleMenu()">Contact</NuxtLink>
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
import PaletteSVG from '@/assets/header/palette.svg?url'
import GradientSVG from '@/assets/header/gradient.svg?url'
import ImgPickerSVG from '@/assets/header/image-picker.svg?url'

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
	z-index: 1002;
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

/* Dropdown Menu */
.has-dropdown {
	
}
.has-dropdown .link.is-droppable {
	display: flex;
	align-items: center;
}
.has-dropdown .is-droppable .menu-icon {
	font-size: 14px;
	margin-left: 2px;
}

.dropdown {
	position: absolute;
	top: 43px;
	left: -200px;
	background: #fff;
	padding: 20px;
	border-radius: 10px;
	box-shadow: rgba(0, 0, 0, 0.05) 0 0 0 1px, rgba(0, 0, 0, 0.12) 0 4px 30px 0px;
	opacity: 0;
	visibility: hidden;
	transform: translateY(-10px);
	will-change: transform, opacity;
	transition: all .2s ease;
}
.has-dropdown:hover .dropdown {
	opacity: 1;
	visibility: visible;
	transform: translateY(0);
}
.has-dropdown:hover .link {
	color: var(--blue);
}
.dropdown.tools-dropdown {
	width: 400px;
}
.dropdown.tools-dropdown::after {
    content: '';
    position: absolute;
    top: -9px;
    left: 53%;
    transform: rotate(45deg);
    width: 16px;
    height: 16px;
    background: #fff;
    border-left: 1px solid #ededed;
    border-top: 1px solid #ededed;
}
.dropdown .link {
	display: flex;
	align-items: center;
	text-decoration: none;
	padding: 10px;
	border-radius: 10px;
	transition: background .2s ease;
}
.dropdown .link-1:hover {
	background: #eef4fd;
}
.dropdown .link-1:hover > .link-text {
	color: #0066ff;
}
.dropdown .link.link-2:hover {
	background: #fff5f5;
}
.dropdown .link.link-2:hover > .link-text {
	color: #ff6868;
}
.dropdown .link.link-3:hover {
	background: #f8f3fd;
}
.dropdown .link.link-3:hover > .link-text {
	color: var(--purple);
}
.dropdown .link-icon {
	width: 51px;
	height: 51px;
	margin-right: 20px;
}
.dropdown .link-icon > img {
	width: 100%;
	height: 100%;
}
.dropdown .link-text {
	color: var(--text-black);
	font-size: 20px;
	font-weight: 500;
	transition: color .2s ease;
}
/* Dropdown Menu */

.menu > ul {
	display: flex;
}
.menu > ul > li {
	position: relative;
	margin-right: 20px;
}
.menu > ul > li:last-child {
	margin-right: 0;
}
.menu > ul > li > .link {
	display: block;
	padding: 10px 0;
	color: var(--text-black);
	font-weight: 500;
	text-decoration: none;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	transition: color .1s;
}
.menu > ul > li > .link:hover {
	color: var(--blue);
}
.menu > ul > li > .link.router-link-exact-active {
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
		padding: 80px 0 30px 30px;
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
		z-index: 1001;
	}
	.show-menu .menu {
		right: 0;
		opacity: 1;
		visibility: visible;
		margin: 0;
	}
	.menu > ul {
		flex-direction: column;
		align-items: flex-start;
	}
	.menu > ul > li {
		margin-right: 0;
		margin-bottom: 20px;
		text-align: center;
	}
	.menu > ul > li:last-child {
		margin-bottom: 0;
	}
	.menu > ul > li > .link {
		font-size: 22px;
		padding: 0;
	}

	/* Dropdown Menu */
	.has-dropdown.tools-dropdown__wrapper > .link {
		display: none;
	}
	.dropdown {
		position: initial;
		top: 0;
		left: 0;
		background: #fff;
		padding: 0;
		border-radius: 0;
		box-shadow: none;
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		transition: all .2s ease;
	}
	.dropdown.tools-dropdown {
		width: auto;
	}
	.dropdown.tools-dropdown::after {
		display: none;
	}
	.dropdown .link {
		padding: 0;
	}
	.dropdown-li:not(:last-child) {
		margin-bottom: 20px;
	}
	.dropdown .link-icon {
		display: none;
	}
	.dropdown .link-text {
		font-size: 22px;
		font-weight: 400;
	}
	/* Dropdown Menu */

	.menu > ul > li > .link {
		font-weight: 400;
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