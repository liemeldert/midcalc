import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const TEXT_SIZE = 50;
const SPEED = 2;

export default function DVDText() {
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const xDirection = useSharedValue(1); // 1 for right, -1 for left
    const yDirection = useSharedValue(1); // 1 for down, -1 for up

    const { width, height } = Dimensions.get('window');
    const maxX = width - TEXT_SIZE;
    const maxY = height - TEXT_SIZE;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: x.value }, { translateY: y.value }],
        };
    });

    useEffect(() => {
        const move = () => {
            'worklet';
            x.value = withTiming(
                x.value + SPEED * xDirection.value,
                { duration: 16, easing: Easing.linear },
                (isFinished) => {
                    if (x.value <= 0 || x.value >= maxX) {
                        xDirection.value *= -1;
                        x.value = Math.max(0, Math.min(x.value, maxX)); // Keep x within bounds
                    }
                }
            );

            y.value = withTiming(
                y.value + SPEED * yDirection.value,
                { duration: 16, easing: Easing.linear },
                (isFinished) => {
                    if (y.value <= 0 || y.value >= maxY) {
                        yDirection.value *= -1;
                        y.value = Math.max(0, Math.min(y.value, maxY)); // Keep y within bounds
                    }
                }
            );

            // Schedule the next frame update
            requestAnimationFrame(move);
        };

        // Start the animation
        move();
    }, [maxX, maxY, x, y, xDirection, yDirection]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.textContainer, animatedStyle]}>
                <Text style={styles.text}>hi</Text>
            </Animated.View>
        </View>
    );
}

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
