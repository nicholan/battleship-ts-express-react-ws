export function randomNum(max) {
    return Math.floor(Math.random() * max);
}
export const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export function generateUniqueId() {
    return (Date.now() + Math.trunc(Math.random() * 10000)).toString(36);
}
//# sourceMappingURL=index.js.map