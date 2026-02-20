"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  User
} from 'lucide-react'
import { useState } from 'react'
import { useSecurity } from '@/hooks/useSecurity'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useSecurity()

  const navItems = [
    { path: '/', label: 'Home', icon: Activity },
    { path: '/analysis', label: 'Analysis', icon: Upload },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-110">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-text-primary">GeneDose.ai</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      relative px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${isActive(item.path)
                        ? 'text-accent bg-accent/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              ) : isAuthenticated && user ? (
                <>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">{user.name}</div>
                    <div className="text-xs text-text-muted capitalize">{user.role}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center hover:scale-105 transition-transform"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4 text-accent" />
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button className="px-5 py-2 font-medium bg-gradient-to-r from-accent to-accent-hover text-black rounded-lg hover-lift flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Log In</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold text-text-primary">GeneDose.ai</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>

          {/* Mobile Menu Items */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 glass-nav border-t border-white/10">
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                        ${isActive(item.path)
                          ? 'text-accent bg-accent/10'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                <div className="border-t border-white/10 pt-4 mt-4">
                  {isLoading ? (
                    <div className="flex justify-center p-2">
                      <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    </div>
                  ) : isAuthenticated && user ? (
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{user.name}</div>
                        <div className="text-xs text-text-muted capitalize">{user.role}</div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center"
                      >
                        <LogOut className="w-4 h-4 text-accent" />
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <button className="w-full py-2 font-medium bg-gradient-to-r from-accent to-accent-hover text-black rounded-lg flex items-center justify-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Log In</span>
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-[72px] md:h-[72px] hidden md:block" />
      <div className="h-[64px] md:hidden" />
    </>
  )
}
