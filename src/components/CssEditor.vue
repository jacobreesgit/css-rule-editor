<template>
  <div class="css-editor-container">
    <h1>CSS Rule Editor</h1>

    <!-- Step Indicator -->
    <div class="step-indicator">
      <div
        class="step"
        :class="{ active: currentStep === 'input', completed: isParsed }"
      >
        <div class="step-number">1</div>
        <div class="step-label">Input JSON</div>
      </div>
      <div class="step-connector" :class="{ completed: isParsed }"></div>
      <div
        class="step"
        :class="{ active: currentStep === 'edit', disabled: !isParsed }"
      >
        <div class="step-number">2</div>
        <div class="step-label">Edit CSS Rules</div>
      </div>
    </div>

    <!-- Input Screen -->
    <div v-if="currentStep === 'input'" class="input-screen">
      <div class="input-card">
        <h2>JSON or Property Input</h2>
        <p class="input-description">
          Paste your JSON-escaped CSS string below. Supports two formats:
        </p>
        <div class="format-examples">
          <div class="format-example">
            <h4>Complete JSON Object:</h4>
            <code
              >{ "customCss": ".my-class { color: red; }\\r\\n.another-class {
              font-size: 16px; }" }</code
            >
          </div>
          <div class="format-example">
            <h4>Property Only:</h4>
            <code
              >"customCss": ".my-class { color: red; }\\r\\n.another-class {
              font-size: 16px; }"</code
            >
          </div>
        </div>

        <textarea
          v-model="jsonInput"
          placeholder="Paste your input here..."
          class="json-textarea"
          @keydown.ctrl.enter="parseJson"
          @keydown.meta.enter="parseJson"
        ></textarea>

        <div class="input-actions">
          <button
            @click="parseJson"
            class="primary-btn"
            :disabled="!jsonInput.trim()"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9,11 12,14 22,4"></polyline>
              <path
                d="M21,12v7a2,2 0,0 1,-2,2H5a2,2 0,0 1,-2,-2V5a2,2 0,0 1,2,-2h11"
              ></path>
            </svg>
            Parse & Continue to Editor
          </button>
          <div class="keyboard-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to parse
          </div>
        </div>

        <div v-if="parseError" class="error-message">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {{ parseError }}
        </div>
      </div>
    </div>

    <!-- Edit Screen -->
    <div v-if="currentStep === 'edit'" class="edit-screen">
      <div class="edit-layout" @click="handleBackgroundClick">
        <!-- Left Panel: Rules Editor -->
        <div class="rules-panel">
          <div class="panel-header">
            <h2>CSS Rules ({{ cssRules.length }})</h2>
            <button @click="goBackToInput" class="back-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              Back to Input
            </button>
          </div>

          <div class="rules-section">
            <div class="rules-list">
              <CssRuleEditor
                v-for="rule in cssRules"
                :key="rule.id"
                :rule="rule"
                :isActive="activeRuleId === rule.id"
                @update="updateRule"
                @remove="removeRule(rule.id)"
                @setActive="setActiveRule"
                @clearActive="clearActiveRule"
              />
            </div>

            <!-- Add New Rule Button -->
            <div class="add-rule-section">
              <button @click="openAddRuleModal" class="add-rule-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Rule
              </button>
            </div>
          </div>
        </div>

        <!-- Right Panel: CSS Preview -->
        <div class="preview-panel">
          <div class="panel-header">
            <h2>CSS Preview</h2>
            <div class="header-actions">
              <button @click="exportToJson" class="export-btn" title="Export">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
            </div>
          </div>

          <div class="css-preview-container">
            <pre class="css-preview" v-html="highlightedCss"></pre>
            <div v-if="!formattedCss" class="empty-state">
              No CSS rules added yet. Use the form on the left to add CSS rules.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Export Modal with Format Options -->
    <div v-if="showExportModal" class="modal-overlay" @click="closeExportModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Export</h3>
          <button @click="closeExportModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <!-- Export Format Options -->
          <div class="export-options">
            <h4>Export Format:</h4>
            <div class="format-buttons">
              <button
                @click="setExportFormat('complete')"
                class="format-btn"
                :class="{ active: exportFormat === 'complete' }"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  ></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                Complete JSON Object
              </button>
              <button
                @click="setExportFormat('property')"
                class="format-btn"
                :class="{ active: exportFormat === 'property' }"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                Property Only
              </button>
              <button
                @click="setExportFormat('css')"
                class="format-btn"
                :class="{ active: exportFormat === 'css' }"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                  ></path>
                </svg>
                CSS
              </button>
            </div>
          </div>

          <!-- Export Textarea -->
          <textarea
            v-model="exportedJson"
            readonly
            class="export-textarea"
            @click="selectAllText"
            :placeholder="
              'Your exported ' +
              (exportFormat === 'complete'
                ? 'JSON object'
                : exportFormat === 'property'
                ? 'property value'
                : 'CSS') +
              ' will appear here'
            "
          ></textarea>
        </div>
        <div class="modal-footer">
          <button
            @click="copyJsonToClipboard"
            class="primary-btn"
            :disabled="!exportedJson"
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
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy to Clipboard
          </button>
          <button @click="closeExportModal" class="secondary-btn">Close</button>
        </div>
      </div>
    </div>

    <!-- Add New Rule Modal -->
    <div v-if="showAddRuleModal" class="modal-overlay" @click="closeAddRuleModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New CSS Rule</h3>
          <button @click="closeAddRuleModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="add-rule-form">
            <label class="form-label">CSS Selector</label>
            <input
              v-model="newRule.selector"
              placeholder="e.g., .my-class, #my-id, div.container"
              class="input-field"
              @keydown.enter="focusFirstDeclaration"
              id="selectorInput"
            />
            
            <label class="form-label">CSS Declarations</label>
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
                  @keydown.tab.prevent="focusNextInput"
                />
                <span class="declaration-colon">:</span>
                <input
                  v-model="decl.value"
                  placeholder="value"
                  class="input-field small"
                  @keydown.enter="addRule"
                />
                <button
                  @click="removeNewDeclaration(index)"
                  class="remove-btn small"
                  :disabled="newRule.declarations.length === 1"
                >
                  ×
                </button>
              </div>
              <button @click="addNewDeclaration" class="add-declaration-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Declaration
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="addRule"
            class="primary-btn"
            :disabled="!canAddRule"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,11 12,14 22,4"></polyline>
              <path d="M21,12v7a2,2 0,0 1,-2,2H5a2,2 0,0 1,-2,-2V5a2,2 0,0 1,2,-2h11"></path>
            </svg>
            Add Rule
          </button>
          <button @click="closeAddRuleModal" class="secondary-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Ref, type ComputedRef } from "vue";
import CssRuleEditor from "./CssRuleEditor.vue";
import type { CssRule, CssDeclaration, CssData } from "../types";
import {
  parseEscapedCss,
  escapeForJson,
  parseCssToRules,
  rulesToCss,
  generateId,
} from "../cssParser";

// Explicit type definitions for better TypeScript support
type StepType = "input" | "edit";
type ExportFormatType = "complete" | "property" | "css";

interface NewRuleData {
  selector: string;
  declarations: CssDeclaration[];
}

// Screen state with explicit types
const currentStep: Ref<StepType> = ref<StepType>("input");
const isParsed: Ref<boolean> = ref<boolean>(false);

// Input state with explicit types
const jsonInput: Ref<string> = ref<string>("");
const parseError: Ref<string> = ref<string>("");

// Editor state with explicit types
const cssRules: Ref<CssRule[]> = ref<CssRule[]>([]);
const activeRuleId: Ref<string | null> = ref<string | null>(null);

// Export state with explicit types
const showExportModal: Ref<boolean> = ref<boolean>(false);
const exportedJson: Ref<string> = ref<string>("");
const exportFormat: Ref<ExportFormatType> = ref<ExportFormatType>("complete");

// Add Rule Modal state
const showAddRuleModal: Ref<boolean> = ref<boolean>(false);

const newRule: Ref<NewRuleData> = ref<NewRuleData>({
  selector: "",
  declarations: [{ property: "", value: "" }],
});

// Computed properties with explicit types
const formattedCss: ComputedRef<string> = computed<string>(() => {
  if (cssRules.value.length === 0) return "";
  return rulesToCss(cssRules.value);
});

// Fixed CSS highlighting without line spacing issues
const highlightedCss: ComputedRef<string> = computed<string>(() => {
  if (!formattedCss.value) return "";

  // If there's an active rule, we need to generate CSS with highlighting
  if (activeRuleId.value) {
    const activeRuleIndex = cssRules.value.findIndex(
      (rule) => rule.id === activeRuleId.value
    );

    if (activeRuleIndex !== -1) {
      // Generate CSS with the active rule wrapped
      const cssWithHighlight = cssRules.value
        .map((rule, index) => {
          const declarations = rule.declarations
            .map((decl) => `  ${decl.property}: ${decl.value};`)
            .join("\n");

          const ruleText = `${rule.selector} {\n${declarations}\n}`;

          // Wrap the active rule
          if (index === activeRuleIndex) {
            return `<span class="active-rule-block">${ruleText}</span>`;
          }
          return ruleText;
        })
        .join("\n\n");

      // Apply syntax highlighting to the CSS with active rule wrapped
      return (
        cssWithHighlight
          // Highlight selectors (but not those inside active-rule-block)
          .replace(
            />([^{<]+)(?=\s*\{)/g,
            '><span class="css-selector">$1</span>'
          )
          .replace(
            /^([^{<]+)(?=\s*\{)/gm,
            '<span class="css-selector">$1</span>'
          )
          // Highlight properties
          .replace(
            /(\s+)([a-zA-Z-]+)(\s*:)/g,
            '$1<span class="css-property">$2</span>$3'
          )
          // Highlight values
          .replace(
            /(:)(\s*)([^;]+)(;)/g,
            '$1$2<span class="css-value">$3</span>$4'
          )
          // Highlight braces
          .replace(/([{}])/g, '<span class="css-brace">$1</span>')
      );
    }
  }

  // No active rule - just apply syntax highlighting
  return (
    formattedCss.value
      // Highlight selectors
      .replace(/^([^{]+)(?=\s*\{)/gm, '<span class="css-selector">$1</span>')
      // Highlight properties
      .replace(
        /(\s+)([a-zA-Z-]+)(\s*:)/g,
        '$1<span class="css-property">$2</span>$3'
      )
      // Highlight values
      .replace(/(:)(\s*)([^;]+)(;)/g, '$1$2<span class="css-value">$3</span>$4')
      // Highlight braces
      .replace(/([{}])/g, '<span class="css-brace">$1</span>')
  );
});

const canAddRule: ComputedRef<boolean> = computed<boolean>(() => {
  return (
    newRule.value.selector &&
    newRule.value.declarations.some(
      (d: CssDeclaration) => d.property && d.value
    )
  );
});

// Functions with explicit typing
function parseJson(): void {
  parseError.value = "";

  try {
    let cssValue: string;

    // First, try to parse as a complete JSON object
    try {
      const data: CssData = JSON.parse(jsonInput.value);
      if (!data.customCss) {
        parseError.value = 'Invalid JSON: missing "customCss" key';
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
        parseError.value =
          'Invalid format. Please provide either:\n1. A complete JSON object: { "customCss": "..." }\n2. Just the property: "customCss": "..."';
        return;
      }
    }

    const decodedCss = parseEscapedCss(cssValue);
    cssRules.value = parseCssToRules(decodedCss);
    isParsed.value = true;
    currentStep.value = "edit";
  } catch (error) {
    parseError.value = "Error processing CSS. Please check your input format.";
    console.error(error);
  }
}

function goBackToInput(): void {
  currentStep.value = "input";
  activeRuleId.value = null;
}

function updateRule(updatedRule: CssRule): void {
  const index = cssRules.value.findIndex(
    (r: CssRule) => r.id === updatedRule.id
  );
  if (index !== -1) {
    cssRules.value[index] = updatedRule;
  }
}

function removeRule(ruleId: string): void {
  cssRules.value = cssRules.value.filter((r: CssRule) => r.id !== ruleId);
  if (activeRuleId.value === ruleId) {
    activeRuleId.value = null;
  }
}

function addNewDeclaration(): void {
  newRule.value.declarations.push({ property: "", value: "" });
}

function removeNewDeclaration(index: number): void {
  newRule.value.declarations.splice(index, 1);
}

function addRule(): void {
  const validDeclarations = newRule.value.declarations.filter(
    (d: CssDeclaration) => d.property && d.value
  );

  if (newRule.value.selector && validDeclarations.length > 0) {
    const newRuleObj: CssRule = {
      id: generateId(),
      selector: newRule.value.selector,
      declarations: validDeclarations,
    };
    cssRules.value.push(newRuleObj);

    // Close modal and reset form
    closeAddRuleModal();
  }
}

function setActiveRule(ruleId: string): void {
  // Toggle functionality: if clicking the same rule, deselect it
  if (activeRuleId.value === ruleId) {
    activeRuleId.value = null;
    return;
  }
  activeRuleId.value = ruleId;
}

function clearActiveRule(): void {
  activeRuleId.value = null;
}

function handleBackgroundClick(event: Event): void {
  // Clear active rule when clicking on background (but not on rule editors)
  const target = event.target as HTMLElement;
  if (
    !target.closest(".css-rule-editor") &&
    !target.closest(".add-rule-form")
  ) {
    clearActiveRule();
  }
}

async function copyCssToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(formattedCss.value);
    console.log("CSS copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy CSS: ", err);
  }
}

// Enhanced export function with format options
function exportToJson(): void {
  showExportModal.value = true;
  updateExportedJson(); // Generate initial export based on current format
}

function setExportFormat(format: ExportFormatType): void {
  exportFormat.value = format;
  updateExportedJson();
}

function updateExportedJson(): void {
  const css = formattedCss.value;

  if (exportFormat.value === "complete") {
    const escapedCss = escapeForJson(css);
    const jsonData = {
      customCss: escapedCss,
    };
    exportedJson.value = JSON.stringify(jsonData, null, 2);
  } else if (exportFormat.value === "property") {
    const escapedCss = escapeForJson(css);
    // Property only format
    exportedJson.value = `"customCss": ${JSON.stringify(escapedCss)}`;
  } else if (exportFormat.value === "css") {
    // Raw CSS format
    exportedJson.value = css;
  }
}

function closeExportModal(): void {
  showExportModal.value = false;
  exportedJson.value = "";
}

async function copyJsonToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(exportedJson.value);
    closeExportModal();
    console.log("JSON copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy JSON: ", err);
  }
}

function selectAllText(event: Event): void {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.select();
}

function focusFirstDeclaration(): void {
  // Focus the first declaration property input when Enter is pressed on selector
  const firstPropertyInput = document.querySelector(
    '.new-declaration input[placeholder="property"]'
  ) as HTMLInputElement;
  if (firstPropertyInput) {
    firstPropertyInput.focus();
  }
}

function focusNextInput(event: Event): void {
  // Simple tab handling for declaration inputs
  const target = event.target as HTMLInputElement;
  const valueInput = target.nextElementSibling
    ?.nextElementSibling as HTMLInputElement;
  if (valueInput) {
    valueInput.focus();
  }
}

// Add Rule Modal functions
function openAddRuleModal(): void {
  showAddRuleModal.value = true;
  // Focus the selector input after modal opens
  setTimeout(() => {
    const selectorInput = document.getElementById('selectorInput') as HTMLInputElement;
    if (selectorInput) {
      selectorInput.focus();
    }
  }, 100);
}

function closeAddRuleModal(): void {
  showAddRuleModal.value = false;
  // Reset form when closing
  newRule.value = {
    selector: "",
    declarations: [{ property: "", value: "" }],
  };
}
</script>

<style scoped>
.css-editor-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 20px 0 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1 {
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  border: 2px solid #ddd;
  background: white;
  color: #999;
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.step.completed .step-number {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.step.disabled .step-number {
  border-color: #eee;
  background: #f8f9fa;
  color: #ccc;
}

.step-label {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.step.active .step-label {
  color: #007bff;
}

.step.completed .step-label {
  color: #28a745;
}

.step-connector {
  width: 120px;
  height: 2px;
  background: #ddd;
  margin: 0 20px;
  transition: background 0.3s ease;
}

.step-connector.completed {
  background: #28a745;
}

/* Input Screen */
.input-screen {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.input-card {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}

.input-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.format-examples {
  margin-bottom: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.format-example {
  margin-bottom: 16px;
}

.format-example:last-child {
  margin-bottom: 0;
}

.format-example h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.format-example code {
  display: block;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 13px;
  color: #666;
  word-break: break-all;
}

.json-textarea {
  width: 100%;
  height: 200px;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 20px;
  transition: border-color 0.2s ease;
}

.json-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.keyboard-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.keyboard-hint kbd {
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: inherit;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  color: #c53030;
  font-size: 14px;
}

/* Edit Screen */
.edit-screen {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.edit-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
  padding-bottom: 20px;
}

.rules-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  min-height: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #545b62;
}

.export-btn,
.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn {
  background: #28a745;
  color: white;
}

.export-btn:hover {
  background: #218838;
}

.copy-btn {
  background: #007bff;
  color: white;
}

.copy-btn:hover:not(:disabled) {
  background: #0056b3;
}

.copy-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.rules-section {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.rules-list {
  flex: 1;
  margin-bottom: 16px;
  overflow-y: auto;
  min-height: 0;
}

.add-rule-section {
  padding: 16px 0 0 0;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.add-rule-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 2px dashed #007bff;
  background: rgba(0, 123, 255, 0.05);
  color: #007bff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-rule-btn:hover {
  background: rgba(0, 123, 255, 0.1);
  border-color: #0056b3;
  color: #0056b3;
}

.add-rule-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-field.small {
  width: auto;
  margin-bottom: 0;
  margin-right: 8px;
}

.new-declarations {
  margin-bottom: 16px;
}

.new-declaration {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.declaration-colon {
  margin: 0 8px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  color: #6f42c1;
  font-weight: bold;
}

.add-declaration-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.add-declaration-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.primary-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: background 0.2s;
}

.remove-btn.small:hover {
  background: #c82333;
}

.css-preview-container {
  flex: 1;
  position: relative;
  min-height: 0;
}

.css-preview {
  width: 100%;
  height: 100%;
  padding: 20px;
  margin: 0;
  background: #f8f9fa;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-y: auto;
  border: none;
  box-sizing: border-box;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #666;
  font-style: italic;
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

/* Active rule highlighting - Block-level approach (no line spacing issues) */
:deep(.active-rule-block) {
  background: rgba(255, 193, 7, 0.2);
  border-radius: 4px;
  display: inline-block;
  white-space: pre-wrap;
  position: relative;
  animation: highlight-pulse 0.6s ease-in;
  box-sizing: border-box;
}

@keyframes highlight-pulse {
  0% {
    background: rgba(255, 193, 7, 0.4);
  }
  50% {
    background: rgba(255, 193, 7, 0.3);
  }
  100% {
    background: rgba(255, 193, 7, 0.2);
  }
}

/* Enhanced Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Export Options Styles */
.export-options {
  margin-bottom: 20px;
}

.export-options h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.format-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.format-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.format-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.format-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.format-btn svg {
  flex-shrink: 0;
}

.export-textarea {
  flex: 1;
  min-height: 200px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 13px;
  resize: none;
  background: #f8f9fa;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.modal-footer .primary-btn,
.modal-footer .secondary-btn {
  height: 40px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .edit-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .preview-panel {
    order: -1;
  }

  .step-connector {
    width: 80px;
    margin: 0 15px;
  }
}

@media (max-width: 768px) {
  .css-editor-container {
    padding: 16px;
  }

  .input-card {
    padding: 24px;
  }

  .step-indicator {
    margin-bottom: 24px;
  }

  .step-connector {
    width: 60px;
    margin: 0 10px;
  }

  .step-number {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }

  .step-label {
    font-size: 12px;
  }

  .new-declaration {
    flex-wrap: wrap;
    gap: 8px;
  }

  .new-declaration .input-field.small {
    min-width: 120px;
  }

  .modal {
    width: 95%;
    margin: 20px;
  }

  .format-buttons {
    flex-direction: column;
  }

  .format-btn {
    justify-content: flex-start;
  }
}
</style>
