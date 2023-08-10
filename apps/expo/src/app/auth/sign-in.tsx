import React from 'react'
import { Pressable, TouchableWithoutFeedback } from 'react-native'
import { useRouter } from 'expo-router'

import SignIn from '~/components/Sign-in'
import { View } from '~/styles/Themed'

const SignInRoute = () => {
    const { back } = useRouter()

    return (
        <Pressable
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
            onPress={() => {
                back()
            }}
        >
            <TouchableWithoutFeedback>
                <View
                    style={{
                        width: '70%',
                        height: '60%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        overflow: 'hidden',
                        borderRadius: 30,
                        borderColor: 'orange',
                        borderStyle: 'dotted',
                        borderWidth: 1
                    }}
                >
                    <SignIn />
                </View>
            </TouchableWithoutFeedback>
        </Pressable>
    )
}

export default SignInRoute