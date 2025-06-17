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
            <div class="header-left">
              <h2>CSS Rules ({{ filteredRules.length }} of {{ cssRules.length }})</h2>
              <!-- Auto-save indicator -->
              <div class="save-indicator" :class="autoSave.saveStatus.value">
                <svg
                  v-if="autoSave.saveStatus.value === 'saving'"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="spin"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg>
                <svg
                  v-else-if="autoSave.saveStatus.value === 'saved'"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9,11 12,14 22,4"></polyline>
                  <path d="M21,12v7a2,2 0,0 1,-2,2H5a2,2 0,0 1,-2,-2V5a2,2 0,0 1,2,-2h11"></path>
                </svg>
                <svg
                  v-else-if="autoSave.saveStatus.value === 'error'"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span class="save-text">
                  {{ autoSave.saveStatus.value === 'saving' ? 'Saving...' :
                     autoSave.saveStatus.value === 'saved' ? 'Saved' :
                     autoSave.saveStatus.value === 'error' ? 'Save failed' : '' }}
                </span>
              </div>
            </div>
            <div class="header-actions">
              <div class="undo-redo-buttons">
                <button 
                  @click="performUndo" 
                  class="undo-btn" 
                  :disabled="!undoRedo.canUndo.value"
                  title="Undo (Ctrl+Z)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
                  </svg>
                </button>
                <button 
                  @click="performRedo" 
                  class="redo-btn" 
                  :disabled="!undoRedo.canRedo.value"
                  title="Redo (Ctrl+Y)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 7v6h-6"></path>
                    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"></path>
                  </svg>
                </button>
              </div>
              <button @click="showSettingsModal = true" class="settings-btn" title="Settings">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
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
                Start New
              </button>
            </div>
          </div>

          <!-- Search and Filter Controls -->
          <div class="search-filter-section">
            <div class="search-container">
              <div class="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search rules by selector, property, or value..."
                  class="search-input"
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="clear-search-btn"
                  title="Clear search"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="filter-controls">
              <select v-model="filterType" class="filter-select">
                <option value="all">All Rules</option>
                <option value="empty">Empty Rules</option>
                <option value="with-property">With Property</option>
                <option value="pattern">Pattern Match</option>
              </select>
              
              <input
                v-if="filterType === 'with-property'"
                v-model="specificPropertyFilter"
                type="text"
                placeholder="Property name..."
                class="property-filter-input"
              />
            </div>
            
            <div v-if="searchQuery || filterType !== 'all'" class="results-info">
              <span class="results-count">{{ filteredRules.length }} of {{ cssRules.length }} results</span>
              <button @click="clearAllFilters" class="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>

          <div class="rules-section">
            <div class="rules-list">
              <div v-if="filteredRules.length === 0 && cssRules.length > 0" class="no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="no-results-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p>No rules match your search criteria</p>
                <button @click="clearAllFilters" class="clear-filters-btn-alt">Clear Filters</button>
              </div>
              
              <CssRuleEditor
                v-for="rule in filteredRules"
                :key="rule.id"
                :rule="rule"
                :isActive="activeRuleId === rule.id"
                :searchQuery="searchQuery"
                @update="updateRule"
                @remove="removeRule(rule.id)"
                @setActive="setActiveRule"
                @clearActive="clearActiveRule"
              />
            </div>

            <!-- Add New Rule Button -->
            <div class="add-rule-section">
              <button @click="openAddRuleModal" class="add-rule-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
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
    <div
      v-if="showAddRuleModal"
      class="modal-overlay"
      @click="closeAddRuleModal"
    >
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Declaration
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="addRule" class="primary-btn" :disabled="!canAddRule">
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
            Add Rule
          </button>
          <button @click="closeAddRuleModal" class="secondary-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettingsModal" class="modal-overlay" @click="closeSettingsModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Settings</h3>
          <button @click="closeSettingsModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="settings-section">
            <h4>Auto-save</h4>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Status:</span>
                <span class="setting-value" :class="autoSave.saveStatus.value">
                  {{ autoSave.isLocalStorageAvailable.value ? 
                      (autoSave.saveStatus.value === 'idle' ? 'Ready' : 
                       autoSave.saveStatus.value === 'saving' ? 'Saving...' :
                       autoSave.saveStatus.value === 'saved' ? 'Saved' : 'Error') 
                      : 'Unavailable' }}
                </span>
              </div>
              <div v-if="autoSave.lastSaved.value" class="setting-info">
                <span class="setting-label">Last saved:</span>
                <span class="setting-value">{{ formatDate(autoSave.lastSaved.value) }}</span>
              </div>
              <div v-if="autoSave.errorMessage.value" class="error-info">
                <span class="setting-label">Error:</span>
                <span class="error-text">{{ autoSave.errorMessage.value }}</span>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h4>Storage</h4>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Used:</span>
                <span class="setting-value">{{ storageInfo.used }} KB</span>
              </div>
              <div class="setting-info">
                <span class="setting-label">Available:</span>
                <span class="setting-value">{{ storageInfo.available }} KB</span>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h4>Data Management</h4>
            <div class="setting-item">
              <button @click="clearAutoSaveData" class="danger-btn" :disabled="!autoSave.isLocalStorageAvailable.value">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Clear Auto-saved Data
              </button>
              <p class="setting-description">
                This will permanently delete all auto-saved CSS rules from your browser's local storage.
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeSettingsModal" class="secondary-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from "vue";
import { CssRuleEditor } from "./";
import type { CssRule, CssDeclaration, CssData } from "../../../lib/types";
import {
  parseEscapedCss,
  escapeForJson,
  parseCssToRules,
  rulesToCss,
  generateId,
} from "../../../lib/utils";
import { useAutoSaveWatcher, useUndoRedo } from "../../../shared/composables";

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

// Search and filtering state
const searchQuery: Ref<string> = ref<string>("");
const filterType: Ref<string> = ref<string>("all");
const specificPropertyFilter: Ref<string> = ref<string>("");

// Auto-save functionality
const autoSave = useAutoSaveWatcher(cssRules, {
  key: 'css-rule-editor-autosave',
  debounceMs: 1000
});

// Undo/Redo functionality
const undoRedo = useUndoRedo({ maxHistorySize: 50 });

// Track if we're currently in an input field to prevent undo/redo during typing
let isTyping = false;

// Settings state
const showSettingsModal: Ref<boolean> = ref<boolean>(false);

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
// Filtered CSS rules based on search query and filter type
const filteredRules: ComputedRef<CssRule[]> = computed<CssRule[]>(() => {
  let filtered = cssRules.value;
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(rule => {
      // Search in selector
      if (rule.selector.toLowerCase().includes(query)) return true;
      
      // Search in property names and values
      return rule.declarations.some(decl => 
        decl.property.toLowerCase().includes(query) || 
        decl.value.toLowerCase().includes(query)
      );
    });
  }
  
  // Apply filter type
  switch (filterType.value) {
    case 'empty':
      filtered = filtered.filter(rule => rule.declarations.length === 0 || 
        rule.declarations.every(decl => !decl.property.trim() || !decl.value.trim()));
      break;
    case 'with-property':
      if (specificPropertyFilter.value.trim()) {
        const propQuery = specificPropertyFilter.value.toLowerCase().trim();
        filtered = filtered.filter(rule => 
          rule.declarations.some(decl => 
            decl.property.toLowerCase().includes(propQuery)
          )
        );
      }
      break;
    case 'pattern':
      // Filter rules matching CSS patterns (classes, IDs, elements)
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(rule => {
          if (query.startsWith('.') && rule.selector.includes('.')) return true;
          if (query.startsWith('#') && rule.selector.includes('#')) return true;
          if (query.match(/^[a-z]+$/i) && rule.selector.match(new RegExp(`\\b${query}\\b`, 'i'))) return true;
          return false;
        });
      }
      break;
    default: // 'all'
      break;
  }
  
  return filtered;
});

const formattedCss: ComputedRef<string> = computed<string>(() => {
  if (filteredRules.value.length === 0) return "";
  return rulesToCss(filteredRules.value);
});

// Fixed CSS highlighting without line spacing issues
const highlightedCss: ComputedRef<string> = computed<string>(() => {
  if (!formattedCss.value) return "";

  let cssToHighlight = formattedCss.value;
  
  // Apply search highlighting if there's a search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim();
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    cssToHighlight = cssToHighlight.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // If there's an active rule, we need to generate CSS with highlighting
  if (activeRuleId.value) {
    const activeRuleIndex = filteredRules.value.findIndex(
      (rule) => rule.id === activeRuleId.value
    );

    if (activeRuleIndex !== -1) {
      // Generate CSS with the active rule wrapped
      const cssWithHighlight = filteredRules.value
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

      cssToHighlight = cssWithHighlight;
      
      // Apply search highlighting
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim();
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        cssToHighlight = cssToHighlight.replace(regex, '<mark class="search-highlight">$1</mark>');
      }
    }
  }

  // Apply syntax highlighting
  return (
    cssToHighlight
      // Highlight selectors (but not those inside active-rule-block or search highlights)
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
});

const canAddRule: ComputedRef<boolean> = computed<boolean>(() => {
  return (
    newRule.value.selector &&
    newRule.value.declarations.some(
      (d: CssDeclaration) => d.property && d.value
    )
  );
});

// Storage info computed property
const storageInfo = computed(() => {
  return autoSave.getStorageInfo();
});

// Lifecycle hooks
onMounted(() => {
  // Load auto-saved data on component mount
  const savedRules = autoSave.load();
  if (savedRules && savedRules.length > 0) {
    cssRules.value = savedRules;
    isParsed.value = true;
    currentStep.value = "edit";
    // Save initial state for undo/redo
    undoRedo.saveState(savedRules);
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);
});

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('keydown', handleKeyboardShortcuts);
  document.removeEventListener('focusin', handleFocusIn);
  document.removeEventListener('focusout', handleFocusOut);
});

// Keyboard shortcuts and undo/redo functions
function handleKeyboardShortcuts(event: KeyboardEvent): void {
  // Only handle shortcuts when not typing in input fields
  if (isTyping || currentStep.value !== 'edit') return;
  
  // Handle Ctrl+Z (Undo) and Ctrl+Y (Redo)
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
    event.preventDefault();
    performUndo();
  } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.shiftKey && event.key === 'Z'))) {
    event.preventDefault();
    performRedo();
  }
}

function handleFocusIn(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    isTyping = true;
  }
}

function handleFocusOut(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    isTyping = false;
    // Save state when leaving input field (only if the rules have actually changed)
    setTimeout(() => {
      saveCurrentState();
    }, 100);
  }
}

function saveCurrentState(operation?: any): void {
  if (cssRules.value.length >= 0) {
    undoRedo.saveState(cssRules.value, operation);
  }
}

function performUndo(): void {
  const previousState = undoRedo.undo();
  if (previousState) {
    cssRules.value = previousState;
  }
}

function performRedo(): void {
  const nextState = undoRedo.redo();
  if (nextState) {
    cssRules.value = nextState;
  }
}

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
    // Save initial state for undo/redo
    undoRedo.saveState(cssRules.value);
  } catch (error) {
    parseError.value = "Error processing CSS. Please check your input format.";
    console.error(error);
  }
}

function goBackToInput(): void {
  currentStep.value = "input";
  activeRuleId.value = null;
  autoSave.clear();
  undoRedo.clear();
}

function updateRule(updatedRule: CssRule, oldRule?: CssRule): void {
  const index = cssRules.value.findIndex(
    (r: CssRule) => r.id === updatedRule.id
  );
  if (index !== -1) {
    const previousRule = oldRule || cssRules.value[index];
    cssRules.value[index] = updatedRule;
    // Only save state if there are meaningful changes
    if (JSON.stringify(previousRule) !== JSON.stringify(updatedRule)) {
      saveCurrentState({ 
        type: 'modify_rule', 
        oldRule: previousRule, 
        newRule: updatedRule, 
        index 
      });
    }
  }
}

function removeRule(ruleId: string): void {
  const ruleIndex = cssRules.value.findIndex(r => r.id === ruleId);
  if (ruleIndex !== -1) {
    const removedRule = cssRules.value[ruleIndex];
    cssRules.value = cssRules.value.filter((r: CssRule) => r.id !== ruleId);
    if (activeRuleId.value === ruleId) {
      activeRuleId.value = null;
    }
    // Save state after rule removal
    saveCurrentState({ type: 'delete_rule', rule: removedRule, index: ruleIndex });
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
    
    // Save state after adding rule
    saveCurrentState({ type: 'add_rule', rule: newRuleObj });

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
    const selectorInput = document.getElementById(
      "selectorInput"
    ) as HTMLInputElement;
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

// Settings Modal functions
function closeSettingsModal(): void {
  showSettingsModal.value = false;
}

function clearAutoSaveData(): void {
  if (confirm('Are you sure you want to clear all auto-saved data? This action cannot be undone.')) {
    autoSave.clear();
    // Clear current rules if they were loaded from auto-save
    if (currentStep.value === "edit" && cssRules.value.length > 0) {
      cssRules.value = [];
      isParsed.value = false;
      currentStep.value = "input";
    }
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

// Search and filter functions
function clearSearch(): void {
  searchQuery.value = "";
}

function clearAllFilters(): void {
  searchQuery.value = "";
  filterType.value = "all";
  specificPropertyFilter.value = "";
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
  margin-bottom: 16px;
  text-align: center;
  font-size: 24px;
  flex-shrink: 0;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 0 20px;
  flex-shrink: 0;
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 16px;
}

.input-card {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.input-description {
  color: #666;
  margin-bottom: 16px;
  font-size: 15px;
  flex-shrink: 0;
}

.format-examples {
  margin-bottom: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  flex-shrink: 0;
}

.format-example {
  margin-bottom: 12px;
}

.format-example:last-child {
  margin-bottom: 0;
}

.format-example h4 {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #333;
}

.format-example code {
  display: block;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.json-textarea {
  width: 100%;
  flex: 1;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: "Fira Code", "Monaco", "Consolas", monospace;
  font-size: 14px;
  resize: none;
  margin-bottom: 16px;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.undo-redo-buttons {
  display: flex;
  gap: 4px;
  margin-right: 8px;
}

.undo-btn,
.redo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.undo-btn:hover:not(:disabled),
.redo-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.undo-btn:disabled,
.redo-btn:disabled {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #ced4da;
  cursor: not-allowed;
}

.undo-btn:not(:disabled):active,
.redo-btn:not(:disabled):active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

/* Auto-save indicator styles */
.save-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
  transition: all 0.3s ease;
}

.save-indicator.saving {
  background: rgba(255, 193, 7, 0.1);
  color: #856404;
}

.save-indicator.saved {
  background: rgba(40, 167, 69, 0.1);
  color: #155724;
}

.save-indicator.error {
  background: rgba(220, 53, 69, 0.1);
  color: #721c24;
}

.save-indicator .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.save-indicator .save-text {
  font-weight: 500;
}

.settings-btn {
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

.settings-btn:hover {
  background: #545b62;
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

/* Settings Modal Styles */
.settings-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.settings-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.setting-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.setting-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.setting-value.saving {
  color: #856404;
}

.setting-value.saved {
  color: #155724;
}

.setting-value.error {
  color: #721c24;
}

.error-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
}

.error-text {
  color: #c53030;
  font-size: 13px;
  word-break: break-word;
}

.danger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.danger-btn:hover:not(:disabled) {
  background: #c82333;
}

.danger-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.setting-description {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* Search and Filter Styles */
.search-filter-section {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.search-container {
  margin-bottom: 12px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  color: #333;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.property-filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  width: 150px;
}

.property-filter-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 123, 255, 0.05);
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 4px;
  font-size: 13px;
}

.results-count {
  color: #007bff;
  font-weight: 500;
}

.clear-filters-btn,
.clear-filters-btn-alt {
  background: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filters-btn:hover,
.clear-filters-btn-alt:hover {
  background: #545b62;
}

.clear-filters-btn-alt {
  padding: 8px 16px;
  font-size: 13px;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-results-icon {
  margin: 0 auto 16px;
  opacity: 0.5;
}

.no-results p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* Search highlighting */
.search-highlight {
  background: yellow !important;
  color: #000 !important;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
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
    padding: 12px;
  }

  .input-card {
    padding: 16px;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .step-indicator {
    margin-bottom: 16px;
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
