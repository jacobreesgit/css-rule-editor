<template>
  <div
    class="css-rule-editor"
    :class="{ active: isActive }"
    @click="handleRuleClick"
    tabindex="0"
  >
    <div class="rule-header">
      <input
        v-model="localRule.selector"
        @blur="updateRule"
        @focus="handleFocus"
        class="selector-input"
        placeholder="CSS Selector"
        @click.stop
      />
      <button @click.stop="$emit('remove')" class="remove-btn">×</button>
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
          @focus="handleFocus"
          class="property-input"
          placeholder="property"
          @click.stop
        />
        <span class="colon">:</span>
        <input
          v-model="decl.value"
          @blur="updateRule"
          @focus="handleFocus"
          class="value-input"
          placeholder="value"
          @click.stop
        />
        <button @click.stop="removeDeclaration(index)" class="remove-decl-btn">
          ×
        </button>
      </div>

      <button @click.stop="addDeclaration" class="add-declaration-btn">
        + Add Declaration
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { CssRule, CssDeclaration } from "../types";

const props = defineProps<{
  rule: CssRule;
  isActive?: boolean;
}>();

const emit = defineEmits<{
  update: [rule: CssRule];
  remove: [];
  setActive: [id: string];
  clearActive: [];
}>();

const localRule = ref<CssRule>(JSON.parse(JSON.stringify(props.rule)));

watch(
  () => props.rule,
  (newRule) => {
    localRule.value = JSON.parse(JSON.stringify(newRule));
  },
  { deep: true }
);

function handleRuleClick(event: Event) {
  // Only activate/toggle if clicking on the rule editor itself, not on inputs
  const target = event.target as HTMLElement;
  if (!target.matches("input, button")) {
    emit("setActive", props.rule.id);
  }
}

function handleFocus() {
  // Only set active, don't toggle on focus
  if (!props.isActive) {
    emit("setActive", props.rule.id);
  }
}

function updateRule() {
  // Filter out empty declarations
  localRule.value.declarations = localRule.value.declarations.filter(
    (decl: CssDeclaration) => decl.property && decl.value
  );
  emit("update", localRule.value);
}

function addDeclaration() {
  localRule.value.declarations.push({
    property: "",
    value: "",
  });
  emit("setActive", props.rule.id);
}

function removeDeclaration(index: number) {
  localRule.value.declarations.splice(index, 1);
  updateRule();
}
</script>

<style scoped>
.css-rule-editor {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.css-rule-editor:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.css-rule-editor.active {
  border-color: #ffc107;
  background: #fffbf0;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
  transform: translateX(2px);
}

.css-rule-editor.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ffc107;
  border-radius: 4px 0 0 4px;
}

.rule-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.selector-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 14px;
  font-weight: 600;
  color: #d73a49;
  background: #f8f9fa;
  transition: border-color 0.2s;
  cursor: text;
}

.selector-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.remove-btn {
  margin-left: 12px;
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
  transition: background 0.2s;
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
  margin-bottom: 8px;
}

.property-input,
.value-input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 13px;
  transition: border-color 0.2s;
  cursor: text;
}

.property-input {
  width: 140px;
  color: #005cc5;
  font-weight: 500;
}

.property-input:focus {
  outline: none;
  border-color: #005cc5;
  box-shadow: 0 0 0 2px rgba(0, 92, 197, 0.25);
}

.value-input {
  flex: 1;
  margin-left: 8px;
  color: #032f62;
}

.value-input:focus {
  outline: none;
  border-color: #032f62;
  box-shadow: 0 0 0 2px rgba(3, 47, 98, 0.25);
}

.colon {
  margin: 0 4px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  color: #6f42c1;
  font-weight: bold;
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
  transition: background 0.2s;
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
  transition: all 0.2s;
}

.add-declaration-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background: #f8f9fa;
}

/* Syntax highlighting for inputs */
.selector-input::placeholder {
  color: #d73a49;
  opacity: 0.5;
}

.property-input::placeholder {
  color: #005cc5;
  opacity: 0.5;
}

.value-input::placeholder {
  color: #032f62;
  opacity: 0.5;
}
</style>
