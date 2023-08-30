import React from 'react'
import ReactDOM from 'react-dom/client'
import アプリ from './アプリ.tsx'
import './メイン.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <アプリ />
  </React.StrictMode>,
)
