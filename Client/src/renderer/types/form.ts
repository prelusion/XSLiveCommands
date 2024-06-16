interface ValidForm {
    valid: true;
}

interface InvalidForm {
    valid: false;
    errors: Array<string>;
}

export type FormResult = ValidForm | InvalidForm;
