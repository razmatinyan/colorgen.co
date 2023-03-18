<template>
    <header id="header">
        <nav class="nav paddings">
            <div class="logo-wrapper">
                <NuxtLink to="/">
                    <img src="/logo.svg" alt="CG - ColorGen">
                </NuxtLink>
            </div>
            <div class="menu">
                <ul class="menu-list reset">
                    <li>
                        <NuxtLink to="/">Home</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/palette">Palette Generator</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/saved">Saved Palettes</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/contact">Contact Us</NuxtLink>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script setup>

</script>

<style scoped>
#header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.1) 0 1px;
    z-index: 1000;
}
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
}
.logo-wrapper {
    flex: 1 1 auto;
}
.logo-wrapper > a {
    display: inline-block;
}
.logo-wrapper > a > img {
    max-width: 90px;
    width: 100%;
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
</style>