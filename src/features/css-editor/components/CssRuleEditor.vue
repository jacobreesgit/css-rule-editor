<template>
  <div
    class="css-rule-editor"
    :class="{ active: isActive }"
    @click="handleRuleClick"
    tabindex="0"
  >
    <div class="rule-header">
      <div class="selector-display" v-if="props.searchQuery && highlightedSelector !== localRule.selector" v-html="highlightedSelector"></div>
      <input
        v-model="localRule.selector"
        @blur="updateRule"
        @focus="handleFocus"
        class="selector-input"
        :class="{ 'search-active': props.searchQuery }"
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
        <div class="declaration-highlights" v-if="props.searchQuery && (highlightedDeclarations[index]?.property !== decl.property || highlightedDeclarations[index]?.value !== decl.value)">
          <div class="property-display" v-html="highlightedDeclarations[index]?.property"></div>
          <span class="colon">:</span>
          <div class="value-display" v-html="highlightedDeclarations[index]?.value"></div>
        </div>
        <div class="declaration-inputs">
          <input
            v-model="decl.property"
            @blur="updateRule"
            @focus="handleFocus"
            class="property-input"
            :class="{ 'search-active': props.searchQuery }"
            placeholder="property"
            @click.stop
          />
          <span class="colon">:</span>
          <input
            v-model="decl.value"
            @blur="updateRule"
            @focus="handleFocus"
            class="value-input"
            :class="{ 'search-active': props.searchQuery }"
            placeholder="value"
            @click.stop
          />
          <button @click.stop="removeDeclaration(index)" class="remove-decl-btn">
            ×
          </button>
        </div>
      </div>

      <button @click.stop="addDeclaration" class="add-declaration-btn">
        + Add Declaration
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { CssRule, CssDeclaration } from "../../../lib/types";

const props = defineProps<{
  rule: CssRule;
  isActive?: boolean;
  searchQuery?: string;
}>();

const emit = defineEmits<{
  update: [rule: CssRule, oldRule?: CssRule];
  remove: [];
  setActive: [id: string];
  clearActive: [];
}>();

const localRule = ref<CssRule>(JSON.parse(JSON.stringify(props.rule)));
const previousRule = ref<CssRule>(JSON.parse(JSON.stringify(props.rule)));

// Function to highlight search matches
function highlightSearchMatches(text: string): string {
  if (!props.searchQuery || !props.searchQuery.trim()) return text;
  
  const query = props.searchQuery.trim();
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Computed properties for highlighted values
const highlightedSelector = computed(() => highlightSearchMatches(localRule.value.selector));
const highlightedDeclarations = computed(() => {
  return localRule.value.declarations.map(decl => ({
    property: highlightSearchMatches(decl.property),
    value: highlightSearchMatches(decl.value),
    originalProperty: decl.property,
    originalValue: decl.value
  }));
});

watch(
  () => props.rule,
  (newRule) => {
    previousRule.value = JSON.parse(JSON.stringify(localRule.value));
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
  emit("update", localRule.value, previousRule.value);
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

/* Search highlighting styles */
.selector-display,
.property-display,
.value-display {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: inherit;
  border: none;
  background: transparent;
  pointer-events: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: transparent;
  z-index: 1;
}

.selector-input.search-active,
.property-input.search-active,
.value-input.search-active {
  background: rgba(255, 255, 0, 0.1);
  position: relative;
  z-index: 2;
}

.declaration {
  position: relative;
}

.declaration-highlights {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

.declaration-inputs {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
}

.property-display {
  width: 140px;
  margin-right: 4px;
}

.value-display {
  flex: 1;
  margin-left: 8px;
  margin-right: 32px;
}

/* Global search highlight styles */
.search-highlight {
  background: yellow !important;
  color: #000 !important;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}
</style>
