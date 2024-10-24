import React, {useRef, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
    Platform,
} from 'react-native';

interface CustomInputProps {
    expression: string;
    setExpression: React.Dispatch<React.SetStateAction<string>>;
    cursorPosition: { start: number; end: number };
    setCursorPosition: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>;
    style?: any;
}

export const CalcInput: React.FC<CustomInputProps> = ({
                                                          expression = '',
                                                          setExpression,
                                                          cursorPosition,
                                                          setCursorPosition,
                                                          style,
                                                      }) => {
    const hiddenInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    }, []);

    const handlePress = () => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        const {key} = e.nativeEvent;

        if (!cursorPosition) {
            cursorPosition = {start: 0, end: 0};
        }

        if (key === 'Backspace') {
            if (cursorPosition.start > 0) {
                const newExpression =
                    expression.slice(0, cursorPosition.start - 1) + expression.slice(cursorPosition.end);
                const newCursorPos = cursorPosition.start - 1;
                setExpression(newExpression);
                setCursorPosition({start: newCursorPos, end: newCursorPos});
            }
        } else if (key.length === 1) {
            const newExpression =
                expression.slice(0, cursorPosition.start) + key + expression.slice(cursorPosition.end);
            const newCursorPos = cursorPosition.start + 1;
            setExpression(newExpression);
            setCursorPosition({start: newCursorPos, end: newCursorPos});
        }
    };

    const renderExpression = () => {
        const elements: React.ReactNode[] = [];
        const exprLength = expression.length;

        if (!cursorPosition) {
            cursorPosition = {start: 0, end: 0};
        }

        for (let i = 0; i <= exprLength; i++) {
            if (i === cursorPosition.start) {
                elements.push(<View key={`cursor-${i}`} style={styles.cursor}/>);
            }
            if (i < exprLength) {
                const char = expression[i];
                elements.push(
                    <Text key={`char-${i}`} style={styles.text}>
                        {char}
                    </Text>
                );
            }
        }
        return elements;
    };

    return (
        <View style={style} onTouchStart={handlePress}>
            <TextInput
                ref={hiddenInputRef}
                value={expression}
                onChangeText={setExpression}
                onKeyPress={handleKeyPress}
                style={styles.hiddenInput}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
            />
            <View style={styles.expressionContainer}>{renderExpression()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: 10,
        minHeight: 50,
        justifyContent: 'center',
    },
    expressionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    text: {
        fontSize: 20,
        color: '#000',
    },
    cursor: {
        width: 2,
        height: 24,
        backgroundColor: '#000',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1,
    },
});
