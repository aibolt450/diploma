'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }

      try {
        // Check user profile for admin role
        const response = await apiClient.get('/users/profile')
        if (response.success && response.profile) {
          const hasAdminRole = response.profile.role === 'admin'
          setIsAdmin(hasAdminRole)
          
          if (!hasAdminRole) {
            router.push('/profile')
          }
        } else {
          router.push('/profile')
        }
      } catch (error) {
        console.error('Failed to check admin role:', error)
        router.push('/profile')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminRole()
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Перевірка прав доступу...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Доступ заборонено
          </h1>
          <p className="text-gray-600 mb-4">
            У вас немає прав адміністратора для доступу до цієї сторінки.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Повернутися до профілю
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}