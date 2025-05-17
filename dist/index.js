"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsernameChecker = void 0;
/* eslint-disable @typescript-eslint/no-require-imports */
require('isomorphic-fetch');
const config_1 = require("./config");
function fetchData(url, overrideHeaders) {
    return __awaiter(this, void 0, void 0, function* () {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            abortController.abort(); // Abort the request if it takes too long
        }, 5000);
        let response;
        try {
            response = yield fetch(url, {
                signal: abortController.signal,
                headers: overrideHeaders !== null && overrideHeaders !== void 0 ? overrideHeaders : {
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            clearTimeout(timeoutId); // Clear the timeout if the request completes within time
            return { response };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            if (error.name === 'AbortError') {
                return { response: response, reason: 'Request timed out.' };
            }
            else if (error.code === 'ECONNABORTED') {
                return { response: response, reason: 'Connection aborted.' };
            }
            else {
                return { response: response, reason: 'An error occurred during the request.' };
            }
        }
    });
}
class UsernameChecker {
    isAvailable(service, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceDetail = this.getServiceDetail(service);
            const result = {
                service,
                url: serviceDetail.url.replace('{{ username }}', encodeURIComponent(username)),
                available: false,
            };
            const { response, reason } = yield fetchData(result.url, serviceDetail.overrideHeaders);
            if (reason) {
                result.reason = reason;
                result.available = undefined;
                return result;
            }
            if (response.status >= 500) {
                result.available = undefined;
                result.reason = `${service} faced internal server error.`;
                return result;
            }
            else if (response.status >= 400 && ![404, 410, 403].includes(response.status)) {
                result.available = undefined;
                result.reason = `Unknown error occured with ${service}`;
                return result;
            }
            for (const rule of serviceDetail.rules) {
                switch (rule.name) {
                    case config_1.UsernameCheckerRuleNameEnum.STATUS_404:
                        if ([404, 410].includes(response.status)) {
                            result.available = true;
                        }
                        break;
                    case config_1.UsernameCheckerRuleNameEnum.STATUS_403:
                        if ([403].includes(response.status)) {
                            result.available = true;
                        }
                        break;
                    case config_1.UsernameCheckerRuleNameEnum.REGEX:
                        if (rule.matches) {
                            const data = yield response.text();
                            for (const match of rule.matches) {
                                const test = new RegExp(match.replace('USERNAME', username), 'gi').test(data);
                                if (test) {
                                    result.available = true;
                                    break;
                                }
                            }
                        }
                        if (rule.notMatches) {
                            const data = yield response.text();
                            for (const match of rule.notMatches) {
                                const test = new RegExp(match.replace('USERNAME', username), 'gi').test(data);
                                if (test) {
                                    result.available = false;
                                    return result;
                                }
                            }
                            result.available = true;
                            break;
                        }
                        break;
                    case config_1.UsernameCheckerRuleNameEnum.URL_NOT_IN_CONTENT:
                        try {
                            const data = yield response.text();
                            if (!data.includes(result.url)) {
                                result.available = true;
                            }
                            // eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
                        }
                        catch (error) { }
                        break;
                }
                if (result.available) {
                    break;
                }
            }
            if (serviceDetail.publicUrl) {
                result.url = serviceDetail.publicUrl.replace('{{ username }}', encodeURIComponent(username));
            }
            return result;
        });
    }
    getServiceDetail(service) {
        return config_1.UsernameCheckerServices[service];
    }
    getServices() {
        return Object.keys(config_1.UsernameCheckerServices);
    }
}
exports.UsernameChecker = UsernameChecker;
