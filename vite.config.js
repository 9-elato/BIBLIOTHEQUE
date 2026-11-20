import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],define:{__ASSET_VERSION__:JSON.stringify(process.env.GITHUB_SHA||Date.now().toString(36))},base:process.env.GITHUB_REPOSITORY?`/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`:'/'})
