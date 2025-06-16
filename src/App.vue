<template>
  <div id="app">
    <CssEditor />
  </div>
</template>

<script setup lang="ts">
import CssEditor from "./components/CssEditor.vue";
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
