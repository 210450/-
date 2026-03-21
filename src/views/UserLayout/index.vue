<template>
  <div class="user-layout">
    <UserHeader />
    <main class="main">
      <router-view />
    </main>
    <UserFooter />
  </div>
</template>

<script setup lang="ts">
import UserHeader from './components/UserHeader.vue'
import UserFooter from './components/UserFooter.vue'
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}
</style>
