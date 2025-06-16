<template>
  <div class="css-rule-editor">
    <div class="rule-header">
      <input
        v-model="localRule.selector"
        @blur="updateRule"
        class="selector-input"
        placeholder="CSS Selector"
      />
      <button @click="$emit('remove')" class="remove-btn">×</button>
    </div>

    <div class="declarations">
      <div
        v-for="(decl, index) in localRule.declarations"
        :key="index"
        class="declaration"
      >
        <input
          v-model="decl.property"
          @blur="updateRule"
          class="property-input"
          placeholder="property"
        />
        <span class="colon">:</span>
        <input
          v-model="decl.value"
          @blur="updateRule"
          class="value-input"
          placeholder="value"
        />
        <button @click="removeDeclaration(index)" class="remove-decl-btn">
          ×
        </button>
      </div>

      <button @click="addDeclaration" class="add-declaration-btn">
        + Add Declaration
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { CssRule } from "./types";

const props = defineProps<{
  rule: CssRule;
}>();

const emit = defineEmits<{
  update: [rule: CssRule];
  remove: [];
}>();

const localRule = ref<CssRule>(JSON.parse(JSON.stringify(props.rule)));

watch(
  () => props.rule,
  (newRule) => {
    localRule.value = JSON.parse(JSON.stringify(newRule));
  },
  { deep: true }
);

function updateRule() {
  // Filter out empty declarations
  localRule.value.declarations = localRule.value.declarations.filter(
    (decl) => decl.property && decl.value
  );
  emit("update", localRule.value);
}

function addDeclaration() {
  localRule.value.declarations.push({
    property: "",
    value: "",
  });
}

function removeDeclaration(index: number) {
  localRule.value.declarations.splice(index, 1);
  updateRule();
}
</script>

<style scoped>
.css-rule-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  background: #f9f9f9;
}

.rule-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.selector-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.remove-btn {
  margin-left: 8px;
  width: 32px;
  height: 32px;
  border: none;
  background: #ff4444;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #cc0000;
}

.declarations {
  margin-left: 20px;
}

.declaration {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.property-input,
.value-input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.property-input {
  width: 150px;
}

.value-input {
  flex: 1;
  margin-left: 8px;
}

.colon {
  margin: 0 4px;
  font-family: monospace;
}

.remove-decl-btn {
  margin-left: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: #ff6666;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-decl-btn:hover {
  background: #ff3333;
}

.add-declaration-btn {
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px dashed #999;
  background: white;
  color: #666;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
}

.add-declaration-btn:hover {
  border-color: #666;
  color: #333;
}
</style>
