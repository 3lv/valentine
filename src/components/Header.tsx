"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { Heart } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  const headerVariants = {
    initial: {
      borderRadius: '0px',
      width: '100%',
      left: '0%',
      right: '0%',
      top: '0px',
      boxShadow: 'none',
    },
    scrolled: {
      borderRadius: '9999px',
      width: 'calc(100% - 64px)',
      left: '32px',
      right: '32px',
      top: '16px',
    },
  }

  const opacity = useTransform(scrollY, [0, 100], [1, 0.98])
  const scale = useTransform(scrollY, [0, 100], [1, 0.98])

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
    return () => unsubscribe()
  }, [scrollY])

  return (
    <motion.header
      className="fixed z-[1000] w-full"
      initial="initial"
      animate={isScrolled ? 'scrolled' : 'initial'}
      variants={headerVariants}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          isScrolled ? 'px-6 rounded-full border border-primary/20' : 'px-4'
        }`}
        style={{ opacity, scale }}
      >
        <div className={`flex h-14 items-center ${isScrolled ? 'justify-between' : ''}`}>
          <Link className="flex items-center justify-center" href="/">
            <Heart className="h-6 w-6 text-love/50" />
            <span className={`pl-2 hidden sm:inline ${isScrolled ? 'sr-only' : ''}`}>Valentine's Day</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#testimonials">
              Album
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4 pl-4">
            <ModeToggle />
          </div>
        </div>
      </motion.div>
    </motion.header>
  )
}