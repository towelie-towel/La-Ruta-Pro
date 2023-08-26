import React, { createContext, useContext, useEffect, useState } from 'react'
import { type Session } from '@supabase/supabase-js'
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useSetAtom } from 'jotai'

import { supabase } from "~/lib/supabase"

const storedIsFirstTime = createJSONStorage<boolean>(() => AsyncStorage)
export const isFirstTimeAtom = atomWithStorage<boolean>('isFirstTime', true, storedIsFirstTime)

interface UserContext {
    session: Session | null | undefined,
    sessionExpired: boolean | undefined
    getSession: (() => Promise<void>),
    signOut: (() => Promise<void>),
    updateUser: ((params: { username?: string, slug?: string, avatar_url?: string, email?: string, }) => Promise<void>),
    user: User | null | undefined,
    error: Error | null | undefined,
    isSignedIn: boolean,
    isLoaded: boolean,
    isLoading: boolean,
    isError: boolean,
}

interface User {
    id?: string | null,
    username?: string | null,
    role?: string | null,
    email?: string | null,
    phone?: string | null,
    slug?: string | null,
    avatar_url?: string | null,
}

const initialValue: UserContext = {
    session: undefined,
    sessionExpired: undefined,
    getSession: async () => { throw new Error("Function not initizaliced yet") },
    signOut: async () => { throw new Error("Function not initizaliced yet") },
    updateUser: async () => { throw new Error("Function not initizaliced yet") },
    user: undefined,
    error: undefined,
    isSignedIn: false,
    isLoaded: false,
    isLoading: false,
    isError: false,
}

const UserContext = createContext(initialValue)

export const useUser = () => {
    return useContext(UserContext);
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

    const [session, setSession] = useState<Session | null>()
    const [sessionExpired, setSessionExpired] = useState<boolean>()
    const [error, setError] = useState<Error | null>()
    const [user, setUser] = useState<User | null>()

    const [isSignedIn, setIsSignedIn] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const setIsFirstTimeAtom = useSetAtom(isFirstTimeAtom)

    const getSession = async () => {
        setIsLoading(true)
        try {
            const { data: { session: resSession }, error } = await supabase.auth.getSession()
            if (error) {
                console.error("⭕ getSession ——© (auth internal error)")
                setSession(null)
                setSessionExpired(undefined)
                setIsError(true)
                setError(error)
            } else if (resSession === null) {
                console.warn("☢️ getSession ——© (session is null)")
                setSession(null)
                setIsError(true)
                setError(new Error("Session is null"))
            } else {
                console.log("👤 getSession ——© (fetched session succesful)")
                setSession(resSession)
                setSessionExpired(undefined)
                setSessionExpired(false)
                setUser({
                    id: resSession?.user.id,
                    phone: resSession?.user.phone,
                    email: resSession?.user.email,
                    username: resSession?.user.user_metadata.username,
                    slug: resSession?.user.user_metadata.slug,
                    role: resSession?.user.user_metadata.role,
                    ...user,
                })
                setIsSignedIn(true)
                setIsError(false)
                setError(null)
            }
        } catch (error) {
            console.error("⭕ getSession ——© (auth error)")
            if (error instanceof Error) {
                setSessionExpired(undefined)
                setIsError(true)
                setError(error)
            }
        } finally {
            setIsLoading(false)
            setIsLoaded(true)
        }
    }

    const signOut = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error("⭕ signOut ——© (auth internal error)")
                // Case intern error
                setIsError(true)
                setError(error)
                setSession(null)
            } else {
                // Case Succes
                console.log("👤 signOut ——© (signed out succesful)")
                setSession(null)
                setUser(null)
                setIsSignedIn(false)
                setIsError(false)
                setError(null)
            }
        } catch (error) {
            console.error("⭕ signOut ——© (error)")
            if (error instanceof Error) {
                setIsError(true)
                setError(error)
                setSession(null)
            }
        } finally {
            setSessionExpired(undefined)
            setIsLoading(false)
            setIsLoaded(true)
        }
    }

    const updateUser = async ({
        username,
        slug,
        avatar_url,
        email
    }: { username?: string, slug?: string, avatar_url?: string, email?: string, }) => {
        setIsLoading(true)
        try {
            const { error } = await supabase.from("profiles").update({
                username: username ? username : undefined,
                slug: slug ? slug : undefined,
                avatar_url: avatar_url ? avatar_url : undefined,
                email: email ? email : undefined
            }).eq('id', 1)
            if (error) {
                console.error("⭕ updateUser ——© (PostgresError internam error)")
                setIsError(true)
                setError({ ...error, name: "PostgresError" })
            } else {
                console.log("👤 signOut ——© (signed out succesful)")
                setUser({
                    ...user,
                    username: username ? username : user?.username,
                    slug: slug ? slug : user?.slug,
                    avatar_url: avatar_url ? avatar_url : user?.avatar_url,
                    email: email ? email : user?.email
                })
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
        console.log("📭 ©—— useEffect ——© context/UserContext.tsx ——© [] (getSession)")
        const expired = session?.expires_at && new Date(session.expires_at) < new Date();
        setSessionExpired(Boolean(expired))

        if (!session || expired) {
            void getSession();
        }

        supabase.auth.onAuthStateChange((_event, session) => {
            console.log("♻️ ——© AuthState Changed ——©" + _event)
            const expired = session?.expires_at && new Date(session.expires_at) < new Date();
            setSessionExpired(Boolean(expired))

            if (!session || expired) {
                void getSession();
            }
        });
    }, []);

    return (
        <UserContext.Provider value={{ session, sessionExpired, user, updateUser, isSignedIn, isLoaded, isLoading, isError, error, getSession, signOut }}>
            {children}
        </UserContext.Provider>
    )
}

/* 
async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateUser({
        username,
        website,
        avatar_url,
    }: {
        username: string
        website: string
        avatar_url: string
    }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }
*/

/* 
can a postgres database hold a function for when updating a table row field, 
another table row with a specific id also update a field?, put an example

Yes, a PostgreSQL database can hold a function that triggers an update on 
another table row when a specific field in a table row is updated. 
This can be achieved using database triggers. 
 
Here's an example of how you can accomplish this: 
 
Let's say we have two tables:  table1  and  table2 . 
We want to update a field in  table2  whenever a specific field in  table1  is updated. 
 
First, we need to create a trigger function that performs the desired update on  table2 :
CREATE OR REPLACE FUNCTION update_table2_field()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE table2
  SET field_to_update = NEW.new_value
  WHERE id = <specific_id>;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;
  
In this example,  NEW.new_value  represents the new value of the field being updated in  table1 , 
and  <specific_id>  is the specific ID of the row in  table2  that you want to update. 
 
Next, we create a trigger on  table1  that calls the trigger function whenever the desired field is updated:
CREATE TRIGGER table1_update_trigger
AFTER UPDATE OF field_to_watch ON table1
FOR EACH ROW
EXECUTE FUNCTION update_table2_field();
In this trigger,  field_to_watch  is the field in  table1  that you want to monitor for updates. 
 
Now, whenever the specified field in  table1  is updated, the trigger function will be executed, 
updating the corresponding row in  table2 . 
 
Please note that you will need to adapt the table and column names, as well as the specific logic, 
to match your database schema and requirements.
*/