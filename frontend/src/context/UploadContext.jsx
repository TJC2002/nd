import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const UploadContext = createContext()

const uploadReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
      }
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      }
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.status !== 'completed' && task.status !== 'failed'),
      }
    case 'SET_DIALOG_OPEN':
      return {
        ...state,
        dialogOpen: action.payload,
      }
    case 'SET_POPOVER_OPEN':
      return {
        ...state,
        popoverOpen: action.payload,
      }
    case 'SET_CURRENT_FOLDER':
      return {
        ...state,
        currentFolderId: action.payload,
      }
    default:
      return state
  }
}

const initialState = {
  tasks: [],
  dialogOpen: false,
  popoverOpen: false,
  currentFolderId: 0,
}

export const UploadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uploadReducer, initialState)

  const addTask = useCallback((task) => {
    dispatch({ type: 'ADD_TASK', payload: task })
  }, [])

  const updateTask = useCallback((taskId, updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, ...updates } })
  }, [])

  const removeTask = useCallback((taskId) => {
    dispatch({ type: 'REMOVE_TASK', payload: taskId })
  }, [])

  const clearCompletedTasks = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' })
  }, [])

  const setDialogOpen = useCallback((open) => {
    dispatch({ type: 'SET_DIALOG_OPEN', payload: open })
  }, [])

  const setPopoverOpen = useCallback((open) => {
    dispatch({ type: 'SET_POPOVER_OPEN', payload: open })
  }, [])

  const setCurrentFolder = useCallback((folderId) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderId })
  }, [])

  const getActiveTasks = useCallback(() => {
    return state.tasks.filter(task => task.status === 'uploading' || task.status === 'pending')
  }, [state.tasks])

  const getCompletedTasks = useCallback(() => {
    return state.tasks.filter(task => task.status === 'completed')
  }, [state.tasks])

  const getFailedTasks = useCallback(() => {
    return state.tasks.filter(task => task.status === 'failed')
  }, [state.tasks])

  const value = {
    tasks: state.tasks,
    dialogOpen: state.dialogOpen,
    popoverOpen: state.popoverOpen,
    currentFolderId: state.currentFolderId,
    addTask,
    updateTask,
    removeTask,
    clearCompletedTasks,
    setDialogOpen,
    setPopoverOpen,
    setCurrentFolder,
    getActiveTasks,
    getCompletedTasks,
    getFailedTasks,
  }

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}

export const useUpload = () => {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider')
  }
  return context
}
