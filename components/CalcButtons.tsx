import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

type Button = {
    value: string;
    type: 'function' | 'clear' | 'number' | 'operator';
    text: string;
};

const buttons: Button[][] = [
    [
        {value: 'sin(|)', type: 'function', text: 'sin'},
        {value: 'AC', type: 'clear', text: 'AC'},
        {value: '(', type: 'operator', text: '('},
        {value: ')', type: 'operator', text: ')'},
        {value: '/', type: 'operator', text: '/'},
    ],
    [
        {value: 'cos(|)', type: 'function', text: 'cos'},
        {value: '7', type: 'number', text: '7'},
        {value: '8', type: 'number', text: '8'},
        {value: '9', type: 'number', text: '9'},
        {value: '*', type: 'operator', text: '*'},
    ],
    [
        {value: 'tan(|)', type: 'function', text: 'tan'},
        {value: '4', type: 'number', text: '4'},
        {value: '5', type: 'number', text: '5'},
        {value: '6', type: 'number', text: '6'},
        {value: '-', type: 'operator', text: '-'},
    ],
    [
        {value: 'sec(|)', type: 'function', text: 'sec'},
        {value: '1', type: 'number', text: '1'},
        {value: '2', type: 'number', text: '2'},
        {value: '3', type: 'number', text: '3'},
        {value: '+', type: 'operator', text: '+'},
    ],
    [
        {value: 'sqrt(|)', type: 'function', text: 'sqrt'},
        {value: '0', type: 'number', text: '0'},
        {value: '.', type: 'number', text: '.'},
        {value: '^', type: 'operator', text: '^'},
        {value: '=', type: 'operator', text: '='},
    ],
];

interface CalcButtonsProps {
    expression: string;
    setExpression: React.Dispatch<React.SetStateAction<string>>;
    setEvaluation: React.Dispatch<React.SetStateAction<string>>;
    setCursorPosition: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>;
    cursorPosition: { start: number; end: number };
    onSubmitEditing: (event: any) => void;
    debouncedEvaluateExpression: (expr: string) => void;
}

const insertAtCursor = (input: string, value: string, cursorPos: number) => {
    return input.slice(0, cursorPos) + value + input.slice(cursorPos);
};

export const CalcButtons: React.FC<CalcButtonsProps> = ({
                                                            expression,
                                                            setExpression,
                                                            setEvaluation,
                                                            setCursorPosition,
                                                            cursorPosition,
                                                            onSubmitEditing,
                                                            debouncedEvaluateExpression,
                                                        }) => {
    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleButtonPress = (button: Button) => {
        if (button.type === "function") {
            const newExpression = insertAtCursor(expression, button.value.replace("|", ""), cursorPosition.start);
            setExpression(newExpression);
            setCursorPosition({
                start: cursorPosition.start + button.value.indexOf("|"),
                end: cursorPosition.start + button.value.indexOf("|")
            });
            debouncedEvaluateExpression(newExpression);
            return;
        }

        switch (button.value) {
            case 'AC':
                cursorPosition.start = 0
                cursorPosition.end = 0
                setExpression('');
                setEvaluation('');
                break;
            case '=':
                onSubmitEditing({
                    nativeEvent: {text: expression},
                    currentTarget: {} as any,
                    target: {} as any,
                    bubbles: false,
                    cancelable: false,
                    defaultPrevented: false,
                    eventPhase: 0,
                    isTrusted: false,
                    preventDefault: function (): void {
                        throw new Error('Function not implemented.');
                    },
                    isDefaultPrevented: function (): boolean {
                        throw new Error('Function not implemented.');
                    },
                    stopPropagation: function (): void {
                        throw new Error('Function not implemented.');
                    },
                    isPropagationStopped: function (): boolean {
                        throw new Error('Function not implemented.');
                    },
                    persist: function (): void {
                        throw new Error('Function not implemented.');
                    },
                    timeStamp: 0,
                    type: '',
                });
                break;
            default:
                const newExpression = insertAtCursor(expression, button.value, cursorPosition.start);
                setExpression(newExpression);
                setCursorPosition({
                    start: cursorPosition.start + button.value.length,
                    end: cursorPosition.start + button.value.length
                });
                debouncedEvaluateExpression(newExpression);

                if (newExpression === '2*sin(2)') {
                    buttons.forEach(row => shuffleArray(row));
                }
                break;
        }
    };

    return (
        <View style={styles.container}>
            {buttons.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.buttonRow}>
                    {row.map((buttonValue) => (
                        <TouchableOpacity
                            key={buttonValue.value}
                            style={styles.button}
                            onPress={() => handleButtonPress(buttonValue)}
                        >
                            {(buttonValue.type === 'function' || buttonValue.type === 'clear') ? (
                                <Text style={styles.fnButtonText}>{buttonValue.text}</Text>
                            ) : (
                                <Text style={styles.buttonText}>{buttonValue.text}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    buttonText: {
        fontSize: 24,
        color: '#000',
    },
    fnButtonText: {
        fontSize: 18,
        color: '#000',
    },
});
