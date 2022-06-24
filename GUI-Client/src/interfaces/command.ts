export interface CommandStruct {
    name: string;
    id: number;
    params: string[];
}

export interface CommandData {
    id: number;
    params: {
        [name: string]: number
    };
}