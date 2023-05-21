export declare function randomNum(max: number): number;
export declare const delay: (ms: number) => Promise<unknown>;
export declare function generateUniqueId(): string;
export declare const debounce: <T extends (...args: any[]) => void>(fn: T, ms?: number) => (...args: Parameters<T>) => void;
