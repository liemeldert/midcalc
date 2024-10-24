import * as React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { cn } from '~/lib/utils';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
    className?: string;
    placeholderClassName?: string;
    cursorLocation: { start: number; end: number };
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
    ({ className, placeholderClassName, cursorLocation, ...props }, ref) => {
        const [inputValue, setInputValue] = React.useState(props.value || '');
        const textInputRef = React.useRef<TextInput>(null);

        const handleChangeText = (text: string) => {
            setInputValue(text);
            if (props.onChangeText) {
                props.onChangeText(text);
            }
        };

        return (
            <View style={styles.container}>
                <TextInput
                    value={inputValue}
                    onChangeText={handleChangeText}
                    className={cn(
                        'web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
                        props.editable === false && 'opacity-50 web:cursor-not-allowed',
                        className
                    )}
                    placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
                    {...props}
                />
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    cursor: {
        position: 'absolute',
        top: 10,
        width: 2,
        height: 24,
        backgroundColor: 'black',
    },
});

Input.displayName = 'Input';

export { Input };
