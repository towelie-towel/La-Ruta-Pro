import React, { useRef } from 'react'
import {
    Animated,
} from 'react-native';

const useFadeIn = ({ defaultValue = false }) => {

    const [isVisible, setIsVisible] = React.useState(defaultValue);
    const animatedValue = useRef(new Animated.Value(1)).current;

    const fadeIn = () => {
        if (!isVisible) {
            setIsVisible((prev) => {
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start();
                return true
            })
        }
    };

    const fadeOut = () => {
        if (isVisible) {
            setIsVisible((prev) => {
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start();
                return false
            })
        }
    };

    return {
        animatedValue,
        fadeIn,
        fadeOut,
        isVisible
    }
}

export default useFadeIn