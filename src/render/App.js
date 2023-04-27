import { useEffect, useState } from 'react'
import { ErrorMessage } from './ErrorMessage.js'
import { Layout } from './Layout.js'

// import './styles/tailwind.css'
import './styles/index.css'
import './styles/styles.css'

const { ipcRenderer } = window.require('electron')

export function App () {
  const [error, setError] = useState('')

  useEffect(() => {
  }, [])

  return (
    <Layout>
      <ErrorMessage message={error} onClose={() => {}} />
    </Layout>
  )
}
