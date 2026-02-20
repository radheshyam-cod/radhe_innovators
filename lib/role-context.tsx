"use client"

import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'clinician' | 'researcher' | 'admin' | 'guest'

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined)

interface RoleProviderProps {
  initialRole?: UserRole
  children: ReactNode
}

export function RoleProvider({ initialRole = 'guest', children }: RoleProviderProps) {
  const [role, setRole] = useState<UserRole>(initialRole)

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return ctx
}

interface RoleGateProps {
  allow: UserRole[] | UserRole
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGate({ allow, fallback = null, children }: RoleGateProps) {
  const { role } = useRole()
  const allowedRoles = Array.isArray(allow) ? allow : [allow]

  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

