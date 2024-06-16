type ButtonCallback = () => void;

export interface ButtonConfig {
    text: string;
    route?: string;
    callback?: ButtonCallback;
    disabled?: () => boolean;
}
