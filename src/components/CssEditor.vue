<template>
  <div class="css-editor-container">
    <h1>CSS Rule Editor</h1>

    <div class="panels">
      <!-- JSON Input Panel -->
      <div class="panel">
        <h2>JSON-Escaped Input</h2>
        <textarea
          v-model="jsonInput"
          placeholder='{ "customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }" }'
          class="json-textarea"
        ></textarea>
        <button @click="parseJson" class="primary-btn">
          Parse & Decode CSS
        </button>
      </div>

      <!-- CSS Preview Panel -->
      <div class="panel">
        <h2>Formatted CSS Preview</h2>
        <pre class="css-preview">{{ formattedCss || "No CSS parsed yet" }}</pre>
      </div>
    </div>

    <!-- Rule Editor Panel -->
    <div class="rule-editor-panel" v-if="cssRules.length > 0 || isParsed">
      <h2>CSS Rules</h2>

      <div class="rules-list">
        <CssRuleEditor
          v-for="rule in cssRules"
          :key="rule.id"
          :rule="rule"
          @update="updateRule"
          @remove="removeRule(rule.id)"
        />
      </div>

      <!-- Add New Rule Form -->
      <div class="add-rule-form">
        <h3>Add New Rule</h3>
        <input
          v-model="newRule.selector"
          placeholder="CSS Selector (e.g., .my-class)"
          class="input-field"
        />
        <div class="new-declarations">
          <div
            v-for="(decl, index) in newRule.declarations"
            :key="index"
            class="new-declaration"
          >
            <input
              v-model="decl.property"
              placeholder="property"
              class="input-field small"
            />
            <span>:</span>
            <input
              v-model="decl.value"
              placeholder="value"
              class="input-field small"
            />
            <button
              @click="removeNewDeclaration(index)"
              class="remove-btn small"
            >
              ×
            </button>
          </div>
          <button @click="addNewDeclaration" class="secondary-btn">
            + Add Declaration
          </button>
        </div>
        <button @click="addRule" class="primary-btn" :disabled="!canAddRule">
          Add Rule
        </button>
      </div>

      <!-- Export Panel -->
      <div class="export-panel">
        <h3>Export JSON</h3>
        <button @click="exportToJson" class="primary-btn">
          Re-encode to JSON Format
        </button>
        <div v-if="exportedJson" class="export-result">
          <h4>Exported JSON:</h4>
          <pre class="json-output">{{ exportedJson }}</pre>
          <button @click="copyToClipboard" class="secondary-btn">
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CssRuleEditor from "./CssRuleEditor.vue";
import type { CssRule, CssDeclaration, CssData } from "./types";
import {
  parseEscapedCss,
  escapeForJson,
  parseCssToRules,
  rulesToCss,
  formatCss,
  generateId,
} from "./cssParser";

const jsonInput = ref("");
const cssRules = ref<CssRule[]>([]);
const isParsed = ref(false);
const exportedJson = ref("");

const newRule = ref<{
  selector: string;
  declarations: CssDeclaration[];
}>({
  selector: "",
  declarations: [{ property: "", value: "" }],
});

const formattedCss = computed(() => {
  if (cssRules.value.length === 0) return "";
  return rulesToCss(cssRules.value);
});

const canAddRule = computed(() => {
  return (
    newRule.value.selector &&
    newRule.value.declarations.some((d) => d.property && d.value)
  );
});

function parseJson() {
  try {
    const data: CssData = JSON.parse(jsonInput.value);
    if (!data.customCss) {
      alert('Invalid JSON: missing "customCss" key');
      return;
    }

    const decodedCss = parseEscapedCss(data.customCss);
    cssRules.value = parseCssToRules(decodedCss);
    isParsed.value = true;
    exportedJson.value = "";
  } catch (error) {
    alert("Invalid JSON format. Please check your input.");
    console.error(error);
  }
}

function updateRule(updatedRule: CssRule) {
  const index = cssRules.value.findIndex((r) => r.id === updatedRule.id);
  if (index !== -1) {
    cssRules.value[index] = updatedRule;
  }
}

function removeRule(ruleId: string) {
  cssRules.value = cssRules.value.filter((r) => r.id !== ruleId);
}

function addNewDeclaration() {
  newRule.value.declarations.push({ property: "", value: "" });
}

function removeNewDeclaration(index: number) {
  newRule.value.declarations.splice(index, 1);
}

function addRule() {
  const validDeclarations = newRule.value.declarations.filter(
    (d) => d.property && d.value
  );

  if (newRule.value.selector && validDeclarations.length > 0) {
    cssRules.value.push({
      id: generateId(),
      selector: newRule.value.selector,
      declarations: validDeclarations,
    });

    // Reset form
    newRule.value = {
      selector: "",
      declarations: [{ property: "", value: "" }],
    };
  }
}

function exportToJson() {
  const css = rulesToCss(cssRules.value);
  const escapedCss = escapeForJson(css);
  const jsonData: CssData = { customCss: escapedCss };
  exportedJson.value = JSON.stringify(jsonData, null, 2);
}

function copyToClipboard() {
  navigator.clipboard
    .writeText(exportedJson.value)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch(() => {
      alert("Failed to copy to clipboard");
    });
}
</script>

<style scoped>
.css-editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 24px;
}

h2 {
  color: #555;
  font-size: 20px;
  margin-bottom: 12px;
}

h3 {
  color: #666;
  font-size: 18px;
  margin-bottom: 10px;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.panel {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.json-textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  resize: vertical;
  margin-bottom: 12px;
}

.css-preview {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

.rule-editor-panel {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.rules-list {
  margin-bottom: 24px;
}

.add-rule-form {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  background: #fafafa;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
}

.input-field.small {
  width: auto;
  margin-bottom: 0;
  margin-right: 8px;
}

.new-declarations {
  margin-bottom: 12px;
}

.new-declaration {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.new-declaration span {
  margin: 0 8px;
  font-family: monospace;
}

.primary-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background: #0056b3;
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.secondary-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.secondary-btn:hover {
  background: #545b62;
}

.remove-btn.small {
  width: 28px;
  height: 28px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn.small:hover {
  background: #c82333;
}

.export-panel {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.export-result {
  margin-top: 16px;
}

.json-output {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
  margin: 12px 0;
}
</style>
