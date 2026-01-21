import { createContext, useContext, useState, useEffect } from 'react'
import { createTheme } from '@mui/material/styles'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode') || 'system'
    return savedMode
  })

  const [colorTheme, setColorTheme] = useState(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') || 'ocean'
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
    ocean: {
      main: '#2E86DE', // Premium Blue
      light: '#54A0FF',
      dark: '#0058A8',
    },
    sunset: {
      main: '#FF6B6B', // Soft Coral
      light: '#FF9F43',
      dark: '#EE5253',
    },
    purple: {
      main: '#5F27CD', // Deep Iris
      light: '#9B59B6',
      dark: '#341F97',
    },
    emerald: {
      main: '#10AC84', // Jungle Green
      light: '#1DD1A1',
      dark: '#0B7558',
    }
  }

  const createMuiTheme = (mode, colorTheme) => {
    // 强制使用深色模式逻辑，但允许切换高亮色
    const colors = colorThemes[colorTheme] || colorThemes.ocean
    const isDark = true 

    return createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: colors.main,
          light: colors.light,
          dark: colors.dark,
        },
        background: {
          default: 'transparent',
          paper: 'rgba(255, 255, 255, 0.03)', // Extremely airy/subtle
        },
        text: {
          primary: '#F5F6FA',
          secondary: 'rgba(245, 246, 250, 0.6)',
        },
        action: {
          hover: 'rgba(255, 255, 255, 0.05)',
          selected: 'rgba(255, 255, 255, 0.1)',
        }
      },
      shape: {
        borderRadius: 6, // Minimal radius
      },
      typography: {
        fontFamily: '"SF Pro Display", "Inter", "Roboto", sans-serif',
        h6: {
            fontWeight: 600,
            letterSpacing: '0.5px',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.5px',
        }
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: `
            :root {
              --mui-palette-primary-main: ${colors.main};
              --mui-palette-primary-light: ${colors.light};
              --mui-palette-primary-dark: ${colors.dark};
              --glass-border: 1px solid rgba(255, 255, 255, 0.08);
              --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
            }
            body {
              background-color: #0f172a;
              background-image: 
                radial-gradient(at 0% 0%, rgba(46, 134, 222, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(95, 39, 205, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(16, 172, 132, 0.1) 0px, transparent 50%),
                radial-gradient(at 0% 100%, rgba(255, 107, 107, 0.1) 0px, transparent 50%);
              background-attachment: fixed;
              background-size: cover;
              min-height: 100vh;
              color: #F5F6FA;
            }
            /* Scrollbar styling */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `,
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px', // Explicitly setting slightly smaller radius for Papers
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: 'transparent !important',
              backdropFilter: 'blur(10px)',
              borderBottom: 'none',
              boxShadow: 'none',
            },
          },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRight: 'none',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4, // Button radius also adjusted to match
                },
                contained: {
                    background: colors.main,
                    boxShadow: `0 8px 16px -4px ${colors.main}66`, // Soft glow
                    color: 'white',
                    '&:hover': {
                        background: colors.dark,
                        boxShadow: `0 12px 20px -4px ${colors.main}88`,
                    }
                },
                outlined: {
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                        borderColor: colors.main,
                        backgroundColor: `${colors.main}1a`,
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }
            }
        }
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
