import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { theme } from './theme.js'
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dates/styles.css"

import './index.css'
import App from './App.jsx'
import { ApplicationsProvider } from './context/ApplicationsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications position="top-right" />
        <BrowserRouter>
        <ApplicationsProvider><App /></ApplicationsProvider>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>,
)
