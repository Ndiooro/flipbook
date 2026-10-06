import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const corePath = path.resolve(import.meta.dirname, 'node_modules/@gullabs/flipbook-core/dist/index.js')
const coreStylesPath = path.resolve(import.meta.dirname, 'node_modules/@gullabs/flipbook-core/dist/style.css')

export default defineConfig({
  plugins: [
    {
      name: 'inline-flipbook-core',
      resolveId(source) {
        if (source === '@flipbook-core-source?raw') return '\0flipbook-core-source'
        if (source === '@flipbook-core-styles?raw') return '\0flipbook-core-styles'
        return undefined
      },
      load(id) {
        if (id === '\0flipbook-core-source') {
          return `export default ${JSON.stringify(fs.readFileSync(corePath, 'utf8'))}`
        }
        if (id === '\0flipbook-core-styles') {
          return `export default ${JSON.stringify(fs.readFileSync(coreStylesPath, 'utf8'))}`
        }
        return undefined
      }
    },
    react()
  ],
  resolve: {
    alias: {
      '@flipbook-core-source': corePath,
      '@flipbook-core-styles': coreStylesPath
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
