import { ref, watch, type Ref } from 'vue'
import type { CssRule } from '../../lib/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveOptions {
  key: string
  debounceMs?: number
}

interface AutoSaveReturn {
  saveStatus: Ref<SaveStatus>
  lastSaved: Ref<Date | null>
  errorMessage: Ref<string>
  isLocalStorageAvailable: Ref<boolean>
  save: (data: CssRule[]) => Promise<void>
  load: () => CssRule[] | null
  clear: () => void
  getStorageInfo: () => { used: number; available: number }
}

export function useAutoSave(options: AutoSaveOptions): AutoSaveReturn {
  const { key, debounceMs = 1000 } = options
  
  const saveStatus = ref<SaveStatus>('idle')
  const lastSaved = ref<Date | null>(null)
  const errorMessage = ref<string>('')
  const isLocalStorageAvailable = ref<boolean>(true)
  
  let saveTimeout: NodeJS.Timeout | null = null

  // Check localStorage availability
  function checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__localStorage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      console.warn('localStorage is not available:', error)
      return false
    }
  }

  // Initialize localStorage availability check
  isLocalStorageAvailable.value = checkLocalStorageAvailability()

  // Save data to localStorage with error handling
  async function save(data: CssRule[]): Promise<void> {
    if (!isLocalStorageAvailable.value) {
      saveStatus.value = 'error'
      errorMessage.value = 'Local storage is not available'
      return
    }

    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Debounce the save operation
    return new Promise((resolve) => {
      saveTimeout = setTimeout(async () => {
        try {
          saveStatus.value = 'saving'
          errorMessage.value = ''
          
          const serializedData = JSON.stringify({
            version: '1.0',
            timestamp: new Date().toISOString(),
            cssRules: data
          })
          
          localStorage.setItem(key, serializedData)
          
          saveStatus.value = 'saved'
          lastSaved.value = new Date()
          
          // Reset to idle after showing "saved" for a moment
          setTimeout(() => {
            if (saveStatus.value === 'saved') {
              saveStatus.value = 'idle'
            }
          }, 2000)
          
          resolve()
        } catch (error) {
          saveStatus.value = 'error'
          
          if (error instanceof Error) {
            if (error.name === 'QuotaExceededError') {
              errorMessage.value = 'Storage quota exceeded. Please clear some data.'
            } else {
              errorMessage.value = `Save failed: ${error.message}`
            }
          } else {
            errorMessage.value = 'An unknown error occurred while saving'
          }
          
          console.error('Auto-save failed:', error)
          resolve()
        }
      }, debounceMs)
    })
  }

  // Load data from localStorage
  function load(): CssRule[] | null {
    if (!isLocalStorageAvailable.value) {
      return null
    }

    try {
      const serializedData = localStorage.getItem(key)
      if (!serializedData) {
        return null
      }

      const parsedData = JSON.parse(serializedData)
      
      // Handle legacy format (direct array) and new format (with metadata)
      if (Array.isArray(parsedData)) {
        return parsedData
      } else if (parsedData.cssRules && Array.isArray(parsedData.cssRules)) {
        return parsedData.cssRules
      }
      
      return null
    } catch (error) {
      console.error('Failed to load auto-saved data:', error)
      errorMessage.value = 'Failed to load saved data'
      return null
    }
  }

  // Clear saved data
  function clear(): void {
    if (!isLocalStorageAvailable.value) {
      return
    }

    try {
      localStorage.removeItem(key)
      saveStatus.value = 'idle'
      lastSaved.value = null
      errorMessage.value = ''
    } catch (error) {
      console.error('Failed to clear saved data:', error)
      errorMessage.value = 'Failed to clear saved data'
    }
  }

  // Get storage usage information
  function getStorageInfo(): { used: number; available: number } {
    if (!isLocalStorageAvailable.value) {
      return { used: 0, available: 0 }
    }

    try {
      let used = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }

      // Estimate available space (most browsers have ~5-10MB limit)
      const estimatedLimit = 5 * 1024 * 1024 // 5MB in bytes
      const available = Math.max(0, estimatedLimit - used)

      return {
        used: Math.round(used / 1024), // Convert to KB
        available: Math.round(available / 1024) // Convert to KB
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { used: 0, available: 0 }
    }
  }

  return {
    saveStatus,
    lastSaved,
    errorMessage,
    isLocalStorageAvailable,
    save,
    load,
    clear,
    getStorageInfo
  }
}

// Auto-save hook that watches data changes
export function useAutoSaveWatcher(
  data: Ref<CssRule[]>,
  options: AutoSaveOptions
): AutoSaveReturn {
  const autoSave = useAutoSave(options)
  
  // Watch for changes and auto-save
  watch(
    data,
    (newData) => {
      if (newData && newData.length >= 0) {
        autoSave.save(newData)
      }
    },
    { deep: true }
  )

  return autoSave
}