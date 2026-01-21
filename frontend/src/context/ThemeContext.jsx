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
      main: '#00d2ff', // 亮青色
      light: '#3a7bd5',
      dark: '#006080',
    },
    sunset: {
      main: '#ff4b1f', // 霓虹橙
      light: '#ff9068',
      dark: '#a62100',
    },
    purple: {
      main: '#bd34fe', // 霓虹紫
      light: '#41295a',
      dark: '#7c00b0',
    },
    emerald: {
      main: '#00f260', // 荧光绿
      light: '#0575e6',
      dark: '#008f35',
    }
  }

  const createMuiTheme = (mode, colorTheme) => {
    // 强制使用深色模式逻辑，但允许切换高亮色
    const colors = colorThemes[colorTheme] || colorThemes.ocean
    const isDark = true // 强制全局为深色基调，打造沉浸感

    return createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: colors.main,
          light: colors.light,
          dark: colors.dark,
        },
        background: {
          default: 'transparent', // 背景透明，由全局 CSS 控制
          paper: 'rgba(30, 30, 30, 0.6)', // 玻璃半透明效果
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
        },
        action: {
          hover: 'rgba(255, 255, 255, 0.1)',
          selected: 'rgba(255, 255, 255, 0.2)',
        }
      },
      shape: {
        borderRadius: 16, // 更大的圆角
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: {
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
              --mui-palette-background-paper: rgba(30, 30, 30, 0.6);
              --glass-border: 1px solid rgba(255, 255, 255, 0.1);
              --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            }
            body {
              background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop');
              background-size: cover;
              background-position: center;
              background-attachment: fixed;
              min-height: 100vh;
              color: white;
            }
          `,
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: 'rgba(0, 0, 0, 0.3) !important',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: 'none',
            },
          },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
                contained: {
                    background: `linear-gradient(45deg, ${colors.dark} 30%, ${colors.main} 90%)`,
                    boxShadow: `0 3px 5px 2px rgba(0, 0, 0, .3)`,
                    color: 'white',
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
