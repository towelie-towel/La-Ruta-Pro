import React from 'react'
import {
    Animated,
} from 'react-native';

const usePressIn = () => {

    const [isPressed, setIsPressed] = React.useState(false);
    const animatedValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        setIsPressed((prev) => {
            Animated.timing(animatedValue, {
                toValue: 0.85,
                duration: 75,
                useNativeDriver: true
            }).start();
            return true
        })
    };

    const handlePressOut = () => {
        setIsPressed((prev) => {
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true
            }).start();
            return false
        })
    };

    return {
        animatedValue,
        handlePressIn,
        handlePressOut,
        isPressed
    }
}

export default usePressIn