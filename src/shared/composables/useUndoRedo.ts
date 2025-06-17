import { ref, type Ref } from 'vue'
import type { CssRule } from '../../lib/types'

export type UndoRedoOperation = 
  | { type: 'add_rule'; rule: CssRule }
  | { type: 'delete_rule'; rule: CssRule; index: number }
  | { type: 'modify_rule'; oldRule: CssRule; newRule: CssRule; index: number }
  | { type: 'modify_declaration'; ruleId: string; oldRule: CssRule; newRule: CssRule }

interface HistoryState {
  rules: CssRule[]
  operation?: UndoRedoOperation
  timestamp: number
}

interface UndoRedoOptions {
  maxHistorySize?: number
}

interface UndoRedoReturn {
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  saveState: (rules: CssRule[], operation?: UndoRedoOperation) => void
  undo: () => CssRule[] | null
  redo: () => CssRule[] | null
  clear: () => void
  getHistorySize: () => number
}

export function useUndoRedo(options: UndoRedoOptions = {}): UndoRedoReturn {
  const { maxHistorySize = 50 } = options
  
  const history = ref<HistoryState[]>([])
  const currentIndex = ref(-1)
  const canUndo = ref(false)
  const canRedo = ref(false)

  function updateCanUndoRedo() {
    canUndo.value = currentIndex.value > 0
    canRedo.value = currentIndex.value < history.value.length - 1
  }

  function saveState(rules: CssRule[], operation?: UndoRedoOperation) {
    // Deep clone the rules to prevent mutation issues
    const clonedRules = JSON.parse(JSON.stringify(rules))
    
    // Check if this state is different from the current state
    if (history.value.length > 0 && currentIndex.value >= 0) {
      const currentState = history.value[currentIndex.value]
      if (JSON.stringify(currentState.rules) === JSON.stringify(clonedRules)) {
        // State hasn't changed, don't save duplicate
        return
      }
    }
    
    const newState: HistoryState = {
      rules: clonedRules,
      operation,
      timestamp: Date.now()
    }

    // If we're not at the end of history, remove everything after current position
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // Add new state
    history.value.push(newState)
    currentIndex.value = history.value.length - 1

    // Limit history size
    if (history.value.length > maxHistorySize) {
      const excess = history.value.length - maxHistorySize
      history.value = history.value.slice(excess)
      currentIndex.value -= excess
    }

    updateCanUndoRedo()
  }

  function undo(): CssRule[] | null {
    if (!canUndo.value) {
      return null
    }

    currentIndex.value--
    updateCanUndoRedo()
    
    return JSON.parse(JSON.stringify(history.value[currentIndex.value].rules))
  }

  function redo(): CssRule[] | null {
    if (!canRedo.value) {
      return null
    }

    currentIndex.value++
    updateCanUndoRedo()
    
    return JSON.parse(JSON.stringify(history.value[currentIndex.value].rules))
  }

  function clear() {
    history.value = []
    currentIndex.value = -1
    updateCanUndoRedo()
  }

  function getHistorySize(): number {
    return history.value.length
  }

  return {
    canUndo,
    canRedo,
    saveState,
    undo,
    redo,
    clear,
    getHistorySize
  }
}