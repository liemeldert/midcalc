import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const TEXT_SIZE = 50;

export default function DVDText() {
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const xDirection = useSharedValue(1);
    const yDirection = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: x.value }, { translateY: y.value }],
        };
    });

    useEffect(() => {
        const interval = setInterval(() => {
            x.value = withTiming(x.value + xDirection.value * 5, {
                duration: 16,
                easing: Easing.linear,
            });
            y.value = withTiming(y.value + yDirection.value * 5, {
                duration: 16,
                easing: Easing.linear,
            });

            if (x.value <= 0 || x.value >= width - TEXT_SIZE) {
                xDirection.value *= -1;
            }
            if (y.value <= 0 || y.value >= height - TEXT_SIZE) {
                yDirection.value *= -1;
            }
        }, 16);

        return () => clearInterval(interval);
    }, [x, y, xDirection, yDirection]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.textContainer, animatedStyle]}>
                <Text style={styles.text}>DVD</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    textContainer: {
        position: 'absolute',
    },
    text: {
        fontSize: TEXT_SIZE,
        color: '#FFF',
    },
});
