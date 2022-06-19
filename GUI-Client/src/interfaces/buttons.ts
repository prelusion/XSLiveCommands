type ButtonCallback = () => void;

interface ButtonConfig {
    text: string;
    window?: string;
    callback?: ButtonCallback;
    disabled?: () => boolean;
}