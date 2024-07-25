export interface XSLCVersion {
    major: number,
    minor: number,
    patch: number,
    type?: 'alpha' | 'beta' | 'rc',
    count?: number,
    build: string,
}

const XSLCv1: XSLCVersion = {
    major: 1,
    minor: 0,
    patch: 0,
    type: "rc",
    count: 1,
    build: 'c'
};

const XSLCv1_STR = "v1.0.0-rc.1c";

export const XSLC_LATEST = XSLCv1;
export const XSLC_VER_STR = XSLCv1_STR;

export enum Compatibility {
    Compatible,
    Outdated,
    Incompatible,
}
