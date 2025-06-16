<template>
  <div class="css-editor-container">
    <h1>CSS Rule Editor</h1>

    <div class="editor-layout">
      <!-- Left Panel: Input & Rules -->
      <div class="left-panel">
        <!-- JSON Input Section -->
        <div class="input-section">
          <h2>JSON or Property Input</h2>
          <textarea
            v-model="jsonInput"
            placeholder='Supports two formats:
1. Complete JSON: { "customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }" }
2. Property only: "customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }"'
            class="json-textarea"
          ></textarea>
          <button @click="parseJson" class="primary-btn">
            Parse & Decode CSS
          </button>
        </div>

        <!-- CSS Rules Section -->
        <div class="rules-section" v-if="cssRules.length > 0 || isParsed">
          <h2>CSS Rules</h2>

          <div class="rules-list">
            <CssRuleEditor
              v-for="rule in cssRules"
              :key="rule.id"
              :rule="rule"
              :isActive="activeRuleId === rule.id"
              @update="updateRule"
              @remove="removeRule(rule.id)"
              @focus="setActiveRule(rule.id)"
              @blur="clearActiveRule"
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
            <button
              @click="addRule"
              class="primary-btn"
              :disabled="!canAddRule"
            >
              Add Rule
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Formatted CSS Preview -->
      <div class="right-panel">
        <div class="preview-header">
          <h2>Formatted CSS Preview</h2>
          <button
            @click="copyCssToClipboard"
            class="copy-btn"
            :disabled="!formattedCss"
            title="Copy CSS to clipboard"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              ></path>
            </svg>
            Copy
          </button>
        </div>

        <div class="css-preview-container">
          <pre class="css-preview" v-html="highlightedCss"></pre>
          <div v-if="!formattedCss" class="empty-state">
            No CSS parsed yet. Enter JSON above and click "Parse & Decode CSS".
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import CssRuleEditor from "./CssRuleEditor.vue";
import type { CssRule, CssDeclaration, CssData } from "../types";
import {
  parseEscapedCss,
  escapeForJson,
  parseCssToRules,
  rulesToCss,
  generateId,
} from "../cssParser";

const jsonInput = ref("");
const cssRules = ref<CssRule[]>([]);
const isParsed = ref(false);
const activeRuleId = ref<string | null>(null);

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

// Highlight CSS with active rule emphasis
const highlightedCss = computed(() => {
  if (!formattedCss.value) return "";

  let css = formattedCss.value;

  // Split CSS into individual rules for processing
  const rules = css.split(/\n\n/);

  const processedRules = rules.map((rule) => {
    if (!rule.trim()) return rule;

    // Apply basic CSS syntax highlighting to each rule
    let highlightedRule = rule
      // Highlight selectors (first line before {)
      .replace(/^([^{]+)(?=\s*\{)/m, '<span class="css-selector">$1</span>')
      // Highlight properties
      .replace(
        /(\s+)([a-zA-Z-]+)(\s*:)/g,
        '$1<span class="css-property">$2</span>$3'
      )
      // Highlight values
      .replace(/(:)(\s*)([^;]+)(;)/g, '$1$2<span class="css-value">$3</span>$4')
      // Highlight braces
      .replace(/([{}])/g, '<span class="css-brace">$1</span>');

    // Check if this rule should be highlighted as active
    if (activeRuleId.value) {
      const activeRule = cssRules.value.find(
        (r) => r.id === activeRuleId.value
      );
      if (activeRule) {
        // Extract the selector from the rule (before the first {)
        const selectorMatch = rule.match(/^([^{]+)(?=\s*\{)/m);
        if (
          selectorMatch &&
          selectorMatch[1].trim() === activeRule.selector.trim()
        ) {
          highlightedRule = `<div class="active-rule">${highlightedRule}</div>`;
        }
      }
    }

    return highlightedRule;
  });

  return processedRules.join("\n\n");
});

const canAddRule = computed(() => {
  return (
    newRule.value.selector &&
    newRule.value.declarations.some(
      (d: CssDeclaration) => d.property && d.value
    )
  );
});

function parseJson() {
  try {
    let cssValue: string;

    // First, try to parse as a complete JSON object
    try {
      const data: CssData = JSON.parse(jsonInput.value);
      if (!data.customCss) {
        alert('Invalid JSON: missing "customCss" key');
        return;
      }
      cssValue = data.customCss;
    } catch (fullJsonError) {
      // If that fails, try to parse as just the "customCss": "..." format
      const input = jsonInput.value.trim();
      const customCssMatch = input.match(
        /^"customCss"\s*:\s*("(?:[^"\\]|\\.)*")\s*,?$/
      );

      if (customCssMatch) {
        // Extract and parse the CSS value
        cssValue = JSON.parse(customCssMatch[1]);
      } else {
        // If neither format works, show error
        alert(
          'Invalid format. Please provide either:\n1. A complete JSON object: { "customCss": "..." }\n2. Just the property: "customCss": "..."'
        );
        console.error("Parse error:", fullJsonError);
        return;
      }
    }

    const decodedCss = parseEscapedCss(cssValue);
    cssRules.value = parseCssToRules(decodedCss);
    isParsed.value = true;
  } catch (error) {
    alert("Error processing CSS. Please check your input format.");
    console.error(error);
  }
}

function updateRule(updatedRule: CssRule) {
  const index = cssRules.value.findIndex(
    (r: CssRule) => r.id === updatedRule.id
  );
  if (index !== -1) {
    cssRules.value[index] = updatedRule;
  }
}

function removeRule(ruleId: string) {
  cssRules.value = cssRules.value.filter((r: CssRule) => r.id !== ruleId);
  if (activeRuleId.value === ruleId) {
    activeRuleId.value = null;
  }
}

function addNewDeclaration() {
  newRule.value.declarations.push({ property: "", value: "" });
}

function removeNewDeclaration(index: number) {
  newRule.value.declarations.splice(index, 1);
}

function addRule() {
  const validDeclarations = newRule.value.declarations.filter(
    (d: CssDeclaration) => d.property && d.value
  );

  if (newRule.value.selector && validDeclarations.length > 0) {
    const newRuleObj = {
      id: generateId(),
      selector: newRule.value.selector,
      declarations: validDeclarations,
    };
    cssRules.value.push(newRuleObj);

    // Reset form
    newRule.value = {
      selector: "",
      declarations: [{ property: "", value: "" }],
    };
  }
}

function setActiveRule(ruleId: string) {
  activeRuleId.value = ruleId;
}

function clearActiveRule() {
  // Don't immediately clear - let the new focus take over
  setTimeout(() => {
    if (!document.activeElement?.closest(".css-rule-editor")) {
      activeRuleId.value = null;
    }
  }, 100);
}

async function copyCssToClipboard() {
  try {
    await navigator.clipboard.writeText(formattedCss.value);
    // You could add a toast notification here
    console.log("CSS copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy CSS: ", err);
  }
}
</script>

<style scoped>
.css-editor-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 600px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.input-section,
.rules-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.rules-section {
  flex: 1;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.preview-header h2 {
  margin: 0;
  flex: 1;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-btn:hover:not(:disabled) {
  background: #0056b3;
}

.copy-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.copy-btn.small {
  padding: 6px 10px;
  font-size: 12px;
}

.css-preview-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.css-preview {
  width: 100%;
  height: 100%;
  padding: 16px;
  margin: 0;
  background: #f8f9fa;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-y: auto;
  border: none;
}

.empty-state {
  padding: 40px 16px;
  text-align: center;
  color: #666;
  font-style: italic;
}

h2 {
  color: #555;
  font-size: 18px;
  margin: 0 0 12px 0;
}

h3 {
  color: #666;
  font-size: 16px;
  margin-bottom: 10px;
}

.json-textarea {
  width: 100%;
  height: 150px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  resize: vertical;
  margin-bottom: 12px;
}

.rules-list {
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.add-rule-form {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
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

/* CSS Syntax Highlighting */
:deep(.css-selector) {
  color: #d73a49;
  font-weight: 600;
}

:deep(.css-property) {
  color: #005cc5;
  font-weight: 500;
}

:deep(.css-value) {
  color: #032f62;
}

:deep(.css-brace) {
  color: #6f42c1;
  font-weight: bold;
}

:deep(.active-rule) {
  background: rgba(255, 235, 59, 0.2);
  border-left: 4px solid #ffc107;
  padding-left: 8px;
  margin: 4px 0;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .right-panel {
    order: -1;
  }
}
</style>
