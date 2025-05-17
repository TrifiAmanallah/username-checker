import { UsernameCheckerServices } from './config';
type UsernameCheckerResponseType = {
    service: keyof typeof UsernameCheckerServices;
    url: string;
    available?: boolean;
    reason?: string;
};
export declare class UsernameChecker {
    isAvailable<T extends keyof typeof UsernameCheckerServices>(service: T, username: string): Promise<UsernameCheckerResponseType>;
    getServiceDetail<T extends keyof typeof UsernameCheckerServices>(service: T): (typeof UsernameCheckerServices)[T];
    getServices(): string[];
}
export {};
