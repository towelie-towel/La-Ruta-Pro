import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { type Session } from '@supabase/supabase-js'

import { supabase } from "~/lib/supabase"

interface UserContext {
    session: Session | null | undefined,
    user: User | null | undefined,
    error: Error | null | undefined,
    isSignedIn: boolean,
    isLoaded: boolean,
    isloading: boolean,
    isError: boolean,
}

interface User {
    id: string,
    userName: string,
    email: string,
    phone: string,
}

const initialValue: UserContext = {
    session: undefined,
    user: undefined,
    error: undefined,
    isSignedIn: false,
    isLoaded: false,
    isloading: false,
    isError: false,
}

const UserContext = createContext(initialValue)

export const useUser = () => {
    return useContext(UserContext);
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [session, setSession] = useState<Session | null>()
    const [error, setError] = useState<Error | null>()
    const [user, setUser] = useState<User>()

    const [isSignedIn, setIsSignedIn] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isloading, setIsLoading] = useState(true)


    useEffect(() => {
        console.log("📭 ©—— useEffect ——© context/UserContext.tsx ——© [session]")
    }, [session])

    const getSession = async () => {
        setIsLoading(true)
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                setIsError(true)
                setError(error)
            } else {
                setSession(session)
                setIsSignedIn(true)
                setIsError(false)
                setError(null)
            }
        } catch (error) {
            if (error instanceof Error) {
                setIsError(true)
                setError(error)
            }
        } finally {
            setIsLoading(false)
            setIsLoaded(true)
        }
    }

    useEffect(() => {
        void getSession()
        console.log("📭 ©—— useEffect ——© context/UserContext.tsx ——© [] (onAuthStateChange)")

        supabase.auth.onAuthStateChange((_event, session) => {
            console.log("♻️ ——© AuthState Changed ——©" + _event)
        })
    }, [])

    return (
        <UserContext.Provider value={{ session, user, isSignedIn, isLoaded, isloading, isError, error }}>
            {children}
        </UserContext.Provider>
    )
}
