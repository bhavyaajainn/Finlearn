import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { checkAuthState } from '@/app/store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, loading, error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!user && loading) {
      dispatch(checkAuthState())
    }
  }, [dispatch, user, loading])

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  }
}

export default useAuth