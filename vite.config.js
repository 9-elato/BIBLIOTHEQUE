import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react(),{name:'release-identity',generateBundle(){this.emitFile({type:'asset',fileName:'build-info.json',source:JSON.stringify({commit:process.env.GITHUB_SHA||null,builtAt:new Date().toISOString()})})}}],define:{__ASSET_VERSION__:JSON.stringify(process.env.GITHUB_SHA||Date.now().toString(36))},base:process.env.GITHUB_REPOSITORY?`/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`:'/'})
