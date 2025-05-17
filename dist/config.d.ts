export declare enum UsernameCheckerRuleNameEnum {
    STATUS_404 = "STATUS_404",
    STATUS_403 = "STATUS_403",
    REGEX = "AVAILABLE",
    URL_NOT_IN_CONTENT = "URL_NOT_IN_CONTENT"
}
type UsernameCheckerRule = {
    name: UsernameCheckerRuleNameEnum;
    matches?: string[];
    notMatches?: string[];
};
type UsernameCheckerServiceType = {
    [key: string]: {
        url: string;
        publicUrl?: string;
        rules: UsernameCheckerRule[];
        overrideHeaders?: HeadersInit;
    };
};
export declare const UsernameCheckerServices: UsernameCheckerServiceType;
export {};
