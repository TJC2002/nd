import { createContext, useContext, useState, useEffect } from 'react'
import { createTheme } from '@mui/material/styles'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode') || 'system'
    return savedMode
  })

  const [colorTheme, setColorTheme] = useState(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') || 'blue'
    return savedColorTheme
  })

  const [systemTheme, setSystemTheme] = useState('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handler = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const effectiveMode = mode === 'system' ? systemTheme : mode

  const colorThemes = {
    blue: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#0d47a1',
    },
    green: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#2e7d32',
    },
    orange: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#c66900',
    },
    purple: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    red: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
  }

  const createMuiTheme = (mode, colorTheme) => {
    const colors = colorThemes[colorTheme] || colorThemes.blue

    return createTheme({
      palette: {
        mode,
        primary: {
          main: colors.main,
          light: colors.light,
          dark: colors.dark,
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#ffffff',
          paper: mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
        },
        text: {
          primary: mode === 'dark' ? '#ffffff' : '#333333',
          secondary: mode === 'dark' ? '#b0b0b0' : '#666666',
        },
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
              color: mode === 'dark' ? '#ffffff' : '#333333',
              boxShadow: 'none',
              borderBottom: '1px solid ' + (mode === 'dark' ? '#333333' : '#e0e0e0'),
            },
          },
        },
      },
    })
  }

  const theme = createMuiTheme(effectiveMode, colorTheme)

  const changeMode = (newMode) => {
    setMode(newMode)
    localStorage.setItem('themeMode', newMode)
  }

  const changeColorTheme = (newColorTheme) => {
    setColorTheme(newColorTheme)
    localStorage.setItem('colorTheme', newColorTheme)
  }

  const value = {
    mode,
    colorTheme,
    effectiveMode,
    systemTheme,
    theme,
    colorThemes,
    changeMode,
    changeColorTheme,
    createMuiTheme,
  }

  if (typeof children === 'function') {
    return <ThemeContext.Provider value={value}>{children(value)}</ThemeContext.Provider>
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
