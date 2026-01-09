import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, db } from '../lib/supabase'
import { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  sellers?: Database['public']['Tables']['sellers']['Row']
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>
  setDemoUser: (userData: any, profileData: Profile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check for demo user profile first
        const demoProfile = localStorage.getItem('demo_user_profile');
        if (demoProfile) {
          const profile = JSON.parse(demoProfile);
          setUser({
            id: profile.id,
            email: profile.email,
            user_metadata: profile,
            app_metadata: {},
            aud: 'authenticated',
            created_at: profile.created_at,
            updated_at: profile.updated_at
          } as any);
          setProfile(profile);
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const profileData = await db.getProfile(session.user.id)
            setProfile(profileData)
          } catch (error) {
            console.error('Error fetching profile:', error)
          }
        }
      } catch (error) {
        console.error('Error getting session:', error)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const profileData = await db.getProfile(session.user.id)
            setProfile(profileData)
          } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    user_type?: 'buyer' | 'seller'
    phone_number?: string
    region?: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          user_type: userData.user_type || 'buyer',
          phone_number: userData.phone_number,
          region: userData.region
        }
      }
    })

    // If signup successful and user wants to be a seller, create seller profile
    if (data.user && !error && userData.user_type === 'seller') {
      try {
        // Wait a bit for the profile trigger to create the basic profile
        setTimeout(async () => {
          try {
            await supabase.rpc('create_seller_profile', {
              user_uuid: data.user!.id,
              store_name_param: `${userData.full_name}'s Store`,
              store_description_param: 'Welcome to my eMerkato store!'
            })
          } catch (sellerError) {
            console.error('Error creating seller profile:', sellerError)
          }
        }, 1000)
      } catch (sellerError) {
        console.error('Error creating seller profile:', sellerError)
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    // Clear demo profile
    localStorage.removeItem('demo_user_profile');
    
    // Clear state immediately for demo mode
    setUser(null);
    setProfile(null);
    
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const setDemoUser = (userData: any, profileData: Profile) => {
    // Store the mock profile in localStorage for demo mode
    localStorage.setItem('demo_user_profile', JSON.stringify(profileData));
    
    // Set the user and profile state immediately
    setUser(userData);
    setProfile(profileData);
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const updatedProfile = await db.updateProfile(user.id, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    setDemoUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}