import { createContext, useContext, useState, useEffect } from 'react'
import { createTheme } from '@mui/material/styles'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'system'
  })

  const [colorTheme, setColorTheme] = useState(() => {
    // Default to 'deepSpace' since 'ocean' is being removed
    const saved = localStorage.getItem('colorTheme')
    const validThemes = ['deepSpace', 'cyberpunk', 'future', 'socialBlue', 'romanticPink', 'businessBlue']
    return validThemes.includes(saved) ? saved : 'deepSpace'
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
    deepSpace: {
      type: 'dark',
      primary: '#00F0FF', // Neon Blue
      background: '#001233', // Deep Blue
      paper: '#0b1d3f', // Slightly lighter than bg
      text: '#E0E0E0', // Laser Silver
      accent: '#00F0FF',
      secondary: '#2A2A2A', // Moon Stone Grey
      // Radial gradient of Deep Blue + Neon Blue
      gradient: `
        radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.15) 0%, transparent 60%),
        radial-gradient(circle at 50% 100%, rgba(0, 18, 51, 1) 0%, rgba(0,0,0,1) 100%)
      `,
      bgColor: '#001233'
    },
    cyberpunk: {
      type: 'dark',
      primary: '#6B48FF', // Electric Purple
      background: '#0A0A0A', // Night Black
      paper: '#141414',
      text: '#E0E0E0', // Titanium Silver
      accent: '#7FFF00', // Fluorescent Green
      secondary: '#A0AEC0',
      // Radial gradient of Black + Electric Purple + Green
      gradient: `
        radial-gradient(circle at 0% 0%, rgba(107, 72, 255, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, rgba(127, 255, 0, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, #0A0A0A 0%, #000000 100%)
      `,
      bgColor: '#0A0A0A'
    },
    future: {
      type: 'dark',
      primary: '#4ECDC4', // Glacier Blue
      background: '#3D3D3D', // Metal Grey
      paper: '#4D4D4D',
      text: '#F5F5F5', 
      accent: '#FF6B6B', // Lava Orange
      secondary: '#A0AEC0',
      // Radial gradient of Metal Grey + Glacier Blue
      gradient: `
        radial-gradient(circle at 50% -20%, rgba(78, 205, 196, 0.2) 0%, transparent 70%),
        linear-gradient(180deg, #3D3D3D 0%, #2b2b2b 100%)
      `,
      bgColor: '#3D3D3D'
    },
    socialBlue: {
      type: 'light',
      primary: '#0084FF',
      background: '#F0F2F5', // Light Grey
      paper: '#FFFFFF',
      text: '#333333',
      accent: '#0084FF',
      secondary: '#E4E6EB',
      gradient: 'linear-gradient(180deg, #E1F5FE 0%, #F0F2F5 100%)',
      bgColor: '#F0F2F5'
    },
    romanticPink: {
      type: 'light',
      primary: '#FF4D6D',
      background: '#FFF0F3', // Light Pink
      paper: '#FFFFFF',
      text: '#4A151F', // Deep Red/Brown
      accent: '#FF4D6D',
      secondary: '#FFC2D1',
      gradient: 'linear-gradient(180deg, #FFF0F3 0%, #FFE4E6 100%)',
      bgColor: '#FFF0F3'
    },
    businessBlue: {
      type: 'light',
      primary: '#3B82F6', // Bright Blue
      background: '#F8FAFC', // Cool White
      paper: '#FFFFFF',
      text: '#1E3A8A', // Deep Blue Text
      accent: '#3B82F6',
      secondary: '#E2E8F0',
      gradient: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)', // Subtle white-to-grey
      bgColor: '#F8FAFC'
    }
  }

  const createMuiTheme = (mode, colorTheme) => {
    // Fallback to deepSpace if invalid theme
    const colors = colorThemes[colorTheme] || colorThemes.deepSpace
    
    // Always force dark mode base structure for these themes as requested
    // even if system is light, these specific themes are "Atmosphere" (dark-ish)
    // but we respect the "mode" variable for MUI's internal calculation if needed, 
    // though here we are customizing heavily.
    
    const isDark = colors.type === 'dark'

    return createTheme({
      palette: {
        mode: colors.type, // Use the theme's type (light/dark)
        primary: {
          main: colors.primary,
        },
        secondary: {
          main: colors.secondary,
        },
        background: {
          default: colors.background,
          paper: colors.paper,
        },
        text: {
          primary: colors.text,
          secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        },
        action: {
          hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          selected: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        }
      },
      shape: {
        borderRadius: 8,
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
              --mui-palette-primary-main: ${colors.primary};
              --glass-border: ${isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)'};
              --glass-shadow: ${isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.2)' : '0 8px 24px 0 rgba(0, 0, 0, 0.05)'};
            }
            body {
              background-color: ${colors.bgColor};
              background-image: ${colors.gradient};
              background-attachment: fixed;
              background-size: cover;
              min-height: 100vh;
              color: ${colors.text};
              transition: background 0.5s ease;
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
              background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            }
          `,
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: isDark ? colors.paper : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: isDark ? 'blur(20px)' : 'blur(10px)', // Reduced blur for performance, still glassy if opacity used
              border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? 'rgba(0,0,0,0.2) !important' : 'rgba(255,255,255,0.7) !important', // Slight darkening for legibility
              backdropFilter: 'blur(12px)',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              boxShadow: 'none',
              color: isDark ? '#fff' : '#000',
            },
          },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: colors.paper,
                    borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
                contained: {
                    background: colors.primary,
                    color: ['deepSpace', 'future'].includes(colorTheme) ? '#000' : '#fff', // Black text for bright neon themes, White for others
                    fontWeight: 700,
                    boxShadow: isDark ? `0 0 15px ${colors.primary}40` : '0 2px 8px rgba(0,0,0,0.1)', // Glow effect
                    '&:hover': {
                        background: colors.primary,
                        filter: 'brightness(1.1)',
                        boxShadow: isDark ? `0 0 25px ${colors.primary}60` : '0 4px 12px rgba(0,0,0,0.15)',
                    }
                },
                outlined: {
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}1a`,
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    '&.MuiChip-colorPrimary': {
                        backgroundColor: `${colors.primary}20`,
                        borderColor: colors.primary,
                        color: colors.primary,
                    }
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
