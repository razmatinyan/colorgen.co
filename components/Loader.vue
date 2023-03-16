<template>
    <div id="loader">
        <div class="loader-in">
            <div class="loader"><div class="waves"></div></div>
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
.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  overflow: hidden;
  height: 150px;
  width: 150px;
  border: 1px solid transparent;
  box-shadow: 0 0 0 2px rgb(25, 116, 253);
  border-radius: 50%;
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgb(30, 146, 255);
  box-shadow: inset 0 0 50px rgb(0,0,0,.3);
}

.waves::before,
.waves::after {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: 0;
  left: 50%;
  transform: translate(-50%, -75%);
  background: #000;
}

.waves::before {
  border-radius: 45%;
  background: rgb(248, 248, 248);
  animation: wave 5s linear infinite;
}

.waves::after {
  border-radius: 40%;
  background: rgb(255,255,255,.5);
  animation: wave 10s linear infinite;
}

@keyframes wave {
  0% {
    transform: translate(-50%, -75%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -75%) rotate(360deg);
  }
}
</style>

<script setup>

</script>