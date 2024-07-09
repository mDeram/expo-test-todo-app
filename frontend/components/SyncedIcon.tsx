import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SyncedIconProps {
    synced: boolean;
}

export function SyncedIcon({ synced }: SyncedIconProps) {
    const opacity = useRef(new Animated.Value(1)).current;
    const invertedOpacity = Animated.subtract(1, opacity);

    useEffect(() => {
        const animation = Animated.timing(opacity, {
            toValue: synced ? 1 : 0,
            delay: 500,
            duration: 500,
            useNativeDriver: true,
        });
        animation.start();

        return () => animation.stop();
    }, [synced, opacity]);

    return (
        <>
        <Animated.View style={{ position: "absolute", top: 8, right: 20, opacity: opacity }}>
            <Ionicons size={32} style={{ color: "black" }} name="cloud-done" />
        </Animated.View>
        <Animated.View style={{ position: "absolute", top: 8, right: 20, opacity: invertedOpacity }}>
            <Ionicons size={32} style={{ color: "black" }} name="cloud-offline" />
        </Animated.View>
        </>
    )
}
