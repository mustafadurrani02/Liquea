import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Liqueia could not find its application root.')
}

if (!window.liqueia) {
  root.innerHTML = `
    <main class="startup-error">
      <section>
        <h1>Liqueia could not start</h1>
        <p>The secure browser bridge did not load. Restart Liqueia or reinstall the application.</p>
      </section>
    </main>
  `
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
