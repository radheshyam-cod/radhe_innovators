'use client'

import { motion } from 'framer-motion'
import { createContext, useContext, useState } from 'react'

interface AnimationConfig {
  initial: object
  animate: object
  transition: object
}

interface MotionContextType {
  animations: AnimationConfig
  setAnimation: (key: string, animation: AnimationConfig) => void
}

const MotionContext = createContext<MotionContextType | undefined>(undefined)

export const MotionProvider = ({ children, animations = { initial: {}, animate: {}, transition: {} } }: { children: React.ReactNode, animations?: AnimationConfig }) => {
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
    ...animations
  })

  const setAnimation = (key: string, animation: AnimationConfig) => {
    setAnimationConfig(prev => ({
      ...prev,
      [key]: { ...animation }
    }))
  }

  return (
    <MotionContext.Provider value={{ animations: animationConfig, setAnimation }}>
      {children}
    </MotionContext.Provider>
  )
}

export const useMotion = () => {
  const context = useContext(MotionContext)
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider')
  }
  return context
}
