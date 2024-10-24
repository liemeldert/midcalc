import React, { useCallback } from 'react';
import { View, StyleSheet, TextInput, ScrollView, NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';
import { Text } from '~/components/ui/text';
import debounce from 'lodash.debounce';
import { parseAndEvaluateLaTeX } from '../lib/BathP';
import { CalcButtons } from '~/components/CalcButtons';
import { CalcInput } from '~/components/CalcInput';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    historyContainer: {
        flex: 1,
        padding: 10,
    },
    expressionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderColor: '#CCCCCC',
        padding: 10,
        borderBottomWidth: 0.5,
    },
    renderedExpression: {
        flex: 1,
        fontSize: 20,
    },
    resultText: {
        fontSize: 18,
        marginLeft: 10,
    },
    inputContainer: {
        borderTopWidth: 1,
        borderColor: '#CCCCCC',
        padding: 10,
        backgroundColor: '#F9F9F9',
    },
    input: {
        fontSize: 20,
        height: 50,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
    },
    katex: {
        flex: 1,
    },
    buttonContainer: {
        padding: 10,
    },
    baseText: {
        fontSize: 20,
    },
    exponentText: {
        fontSize: 12,
        lineHeight: 20,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#CCCCCC',
        height: 50,
    }
});

interface HistoryItem {
    expression: string;
    result: string;
}

function balanceParentheses(expr: string): string {
    const openParentheses = expr.split('(').length - 1;
    const closeParentheses = expr.split(')').length - 1;
    const diff = openParentheses - closeParentheses;
    return diff > 0 ? expr + ')'.repeat(diff) : expr;
}

export default function Calc() {
    const [expression, setExpression] = React.useState('');
    const [evaluation, setEvaluation] = React.useState('');
    const [history, setHistory] = React.useState<HistoryItem[]>([]);
    const [useKatex, setUseKatex] = React.useState(false);
    const [cursorPosition, setCursorPosition] = React.useState({ start: 0, end: 0 });

    const renderExpression = (expr: string) => {
        const elements = [];
        const stack: string[] = [];
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'];
        let colorIndex = 0;

        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];

            if (char === '(') {
                const color = colors[colorIndex % colors.length];
                colorIndex++;
                stack.push(color);
                elements.push(
                    <Text key={i} style={{ color }}>
                        {char}
                    </Text>
                );

            } else if (char === ')') {
                const color = stack.pop() || '#000';
                elements.push(
                    <Text key={i} style={{ color }}>
                        {char}
                    </Text>
                );
                colorIndex = Math.max(colorIndex - 1, 0);
            } else if (char === '^') {
                const base = expr[i - 1];
                const exponent = expr[i + 1];
                elements.pop(); // Remove base
                elements.push(
                    <Text key={i} style={styles.baseText}>
                        {base}
                        <Text style={styles.exponentText}>{exponent}</Text>
                    </Text>
                );
                i++; // Skip exponent character as it's already processed
            } else {
                elements.push(
                    <Text key={i} style={{ color: '#000' }}>
                        {char}
                    </Text>
                );
            }
        }

        return elements;
    };

    const evaluateExpression = (expr: string): void => {
        if (expr.trim() === '') {
            setEvaluation('');
            return;
        }
        try {
            const result: string = parseAndEvaluateLaTeX(expr).toString();
            setEvaluation(result);
        } catch (error) {
            setEvaluation('Error');
        }
    };

    const debouncedEvaluateExpression = useCallback(debounce(evaluateExpression, 500), []);

    const handleInputChange = (text: string) => {
        const lastChar = text.slice(-1);
        let updatedText = text;

        if (lastChar === '(') {
            updatedText = text + ')';
            // setCursorPosition({ start: text.length, end: text.length });
        } else if (lastChar === ')' && expression.slice(-1) === ')') {
            updatedText = text.slice(0, -1);
        } else if (lastChar === ')' && expression.slice(-1) !== ')') {
            updatedText = text;
        }

        setExpression(updatedText);
        debouncedEvaluateExpression(updatedText);
    };

    const handleSubmitEditing = (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
        const expr = event.nativeEvent.text;
        if (expr.trim() === '') return;
        let result: string;
        try {
            result = parseAndEvaluateLaTeX(expr).toString();
        } catch (error) {
            result = 'Error';
        }
        setHistory([{ expression: expr, result }, ...history]);
        setExpression('');
        setEvaluation('');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.historyContainer}>
                {history.map((item, index) => (
                    <View key={index} style={styles.expressionContainer}>
                        <Text style={styles.renderedExpression}>
                            {renderExpression(item.expression)}
                        </Text>
                        <Text style={styles.resultText}>= {item.result}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.inputContainer}>
                <CalcInput
                    expression={expression}
                    setExpression={setExpression}
                    // onChangeText={handleInputChange}
                    // placeholder="Enter expression"
                    style={styles.input}
                    // autoCorrect={false}
                    // keyboardType="default"
                    // autoCapitalize="none"
                    // onSubmitEditing={handleSubmitEditing}
                    // returnKeyType="done"
                    // onSelectionChange={({ nativeEvent: { selection } }) => setCursorPosition(selection)}
                    cursorPosition={cursorPosition}
                    setCursorPosition={setCursorPosition}
                />
            </View>
            <View style={styles.buttonContainer}>
                <CalcButtons
                    expression={expression}
                    setExpression={setExpression}
                    setEvaluation={setEvaluation}
                    setCursorPosition={setCursorPosition}
                    cursorPosition={cursorPosition}
                    onSubmitEditing={handleSubmitEditing}
                    debouncedEvaluateExpression={debouncedEvaluateExpression}
                />
            </View>
            <View style={styles.bottomBar}>
                <Text>{cursorPosition.start}:{cursorPosition.end}</Text>
                <Text>Mode: {useKatex ? 'Katex' : 'Text'}</Text>
            </View>
        </View>
    );
}
