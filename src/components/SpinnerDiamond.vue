<template>
  <span class="spinner spinner--rotate-diamond" style="width: 60px; height: 15px;">
    <div class="diamond" style="width: 15px; height: 15px;"></div>
    <div class="diamond" style="width: 15px; height: 15px;"></div>
    <div class="diamond" style="width: 15px; height: 15px;"></div>
  </span>
</template>

<style scoped>
.spinner {
  position: relative;
  display: block;
}

.spinner * {
  line-height: 0;
  box-sizing: border-box;
}

.spinner .diamond {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px;
  background: #000;
  transform: translateX(-50%) rotate(45deg) scale(0);
  animation: diamonds 1500ms linear infinite;
}

.spinner .diamond:nth-child(1) {
  animation-delay: -1000ms;
}

.spinner .diamond:nth-child(2) {
  animation-delay: -2000ms;
}

.spinner .diamond:nth-child(3) {
  animation-delay: -3000ms;
}

@keyframes diamonds {
  50% {
    left: 50%;
    transform: translateX(-50%) rotate(45deg) scale(1);
  }

  100% {
    left: 100%;
    transform: translateX(-50%) rotate(45deg) scale(0);
  }
}
</style>