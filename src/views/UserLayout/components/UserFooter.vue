<template>
  <footer class="user-footer">
    <div class="container footer-inner">
      <span>© 2026 心理健康AI助手，保留所有权利。</span>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.user-footer {
  background: #1f2d3d;
  color: rgba(255, 255, 255, 0.85);
  height: 56px;
  display: flex;
  align-items: center;
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 24px;
}

.footer-inner {
  font-size: 12px;
  text-align: center;
  width: 100%;
}
</style>
