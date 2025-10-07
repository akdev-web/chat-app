import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ThemeProvider from './context/ThemeContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import {ScreenSizeProvider} from './components/util/ScreenSizeContext.jsx'
import {G_ChatContextProvider} from './context/G_ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ScreenSizeProvider>
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <G_ChatContextProvider>
            <App />
          </G_ChatContextProvider>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
    </ScreenSizeProvider>
  // </StrictMode>,
)
