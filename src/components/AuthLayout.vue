<template>
  <div class="auth-layout">
   <div class="auth-leftcontent">
    <h1 class="title">心理AI助手</h1>
    <p>每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受,让心与心的连接温暖您的每一天</p>
    <div class="auth-image">
        <el-image
          :src="authImage"
          alt="登录图片"
          style="width: 70px; height: 70px;"
        />
    </div>
    </div>
    <div class="auth-rightcontent">
     <div class="auth-rightcontent-form">
      <router-view></router-view>
     </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const authImage = new URL('@/assets/images/robot-fill.png', import.meta.url).href
</script>
<style scoped>
.auth-layout {
  display: flex;
  height: 100vh;

.auth-leftcontent {
    background-color: rgba(85, 141, 126, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 100%;
  .title {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }
   p {
    width: 50%;
    text-align: center;
    flex-wrap: wrap;
    color: #fff;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
  .auth-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 1px solid #558d7e;
    flex-shrink: 0;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
}
.auth-rightcontent {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
}
</style>
