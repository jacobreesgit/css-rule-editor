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

/* Add Font for better code display */
@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap");

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus styles for better accessibility */
*:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

button:focus,
input:focus,
textarea:focus {
  outline: 2px solid #007bff;
  outline-offset: 1px;
}
</style>
