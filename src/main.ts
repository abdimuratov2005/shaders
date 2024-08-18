import { elRefs } from './api/data';
import { App } from './functions/App'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div data-canvas="loading">
    <div data-canvas="loadingProgress"></div>
  </div>
  <div data-canvas="app"></div>
`

elRefs.renderer = document.querySelector("[data-canvas='app']")!;
elRefs.loading.el = document.querySelector('[data-canvas="loading"]')!;
elRefs.loading.progress = document.querySelector('[data-canvas="loadingProgress"]')!
new App();