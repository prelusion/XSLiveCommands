interface ValidForm {
    valid: true;
    errors: [];  /* Always empty */
}

interface InvalidForm {
    valid: false;
    errors: Array<string>;
}

export type FormResult = ValidForm | InvalidForm;