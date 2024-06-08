type ButtonCallback = () => void;

export interface ButtonConfig {
    text: string;
    window?: string;
    callback?: ButtonCallback;
    disabled?: () => boolean;
}