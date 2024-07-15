export interface XSLCVersion {
    major: number,
    minor: number,
    patch: number,
    type?: 'alpha' | 'beta' | 'rc',
    count?: number,
}

const XSLCv1: XSLCVersion = {
    major: 1,
    minor: 0,
    patch: 0,
    type: "rc",
    count: 1,
};

const XSLCv1Str = "v1.0.0-rc.1";

export const XSLC_LATEST = XSLCv1;
export const XSLC_VER_STR = XSLCv1Str;
