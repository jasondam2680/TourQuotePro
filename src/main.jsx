import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// ─────────────────────────────────────────────────────────────
//  localStorage shim — thay thế window.storage của Claude.ai
//  Dữ liệu được lưu trong localStorage của trình duyệt,
//  không mất khi đóng tab / tắt máy.
// ─────────────────────────────────────────────────────────────
window.storage = {
  /**
   * Lấy giá trị theo key
   * @returns {{ key, value } | null}
   */
  get: async (key) => {
    try {
      const value = localStorage.getItem(key)
      if (value === null) throw new Error('Key not found: ' + key)
      return { key, value }
    } catch (e) {
      throw e
    }
  },

  /**
   * Lưu giá trị
   * @returns {{ key, value }}
   */
  set: async (key, value) => {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      return { key, value }
    } catch (e) {
      console.error('storage.set error:', e)
      return null
    }
  },

  /**
   * Xóa một key
   * @returns {{ key, deleted }}
   */
  delete: async (key) => {
    try {
      localStorage.removeItem(key)
      return { key, deleted: true }
    } catch (e) {
      console.error('storage.delete error:', e)
      return null
    }
  },

  /**
   * Liệt kê tất cả key (có thể lọc theo prefix)
   * @returns {{ keys: string[] }}
   */
  list: async (prefix = '') => {
    try {
      const keys = Object.keys(localStorage).filter(k =>
        prefix ? k.startsWith(prefix) : true
      )
      return { keys }
    } catch (e) {
      console.error('storage.list error:', e)
      return { keys: [] }
    }
  }
}

import App from './TourQuoteFinal'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
