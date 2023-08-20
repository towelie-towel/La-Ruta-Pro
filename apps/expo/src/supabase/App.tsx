import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Signin from './Signin'
import Account from './Account'
import { View } from 'react-native'
import { type Session } from '@supabase/supabase-js'

export default function SupabaseAuth() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session)
            })
            .catch((error) => {
                console.log('error', error)
            })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])

    return (
        <View>
            {session && session.user ? <Account key={session.user.id} session={session} /> : <Signin />}
        </View>
    )
}