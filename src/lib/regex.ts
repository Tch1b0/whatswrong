export function isIdentifier(str: string) {
    return /^[a-zA-Z\_][a-zA-Z\_0-9]*$/.test(str);
}

export function isNumber(str: string) {
    return /^([0-9]*(\.[0-9]+)*)+$/.test(str);
}
