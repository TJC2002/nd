import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  })

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity })
  }

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const value = {
    notification,
    showNotification,
    closeNotification,
  }

  if (typeof children === 'function') {
    return <NotificationContext.Provider value={value}>{children(value)}</NotificationContext.Provider>
  }
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}