'use client'

import { motion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

// Animation Variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

// Floating animation for decorative elements
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Animation Components
interface MotionWrapperProps {
  children: ReactNode
  className?: string
  delay?: number
  variants?: Variants
}

export function FadeInUp({ children, className, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, className, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.5, delay, ease: 'easeOut' }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, className, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: MotionWrapperProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// Hover animations for interactive elements
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 }
}

export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)' },
  transition: { duration: 0.3 }
}

// Page transition wrapper
export function PageTransition({ children, className }: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export { motion }