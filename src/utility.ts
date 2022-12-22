export function toCamelCase(variable: string): string {
    let n = "";

    for (let i = 0; i < variable.length; i++) {
        const char = variable[i];
        if (i === 0) {
            n += char.toLowerCase();
        } else if (char === "_") {
            continue;
        } else if (variable[i - 1] === "_") {
            n += char.toUpperCase();
        } else {
            n += char;
        }
    }

    return n;
}

export function toPascalCase(variable: string): string {
    let n = toCamelCase(variable);
    n = n[0].toUpperCase() + n.slice(1);
    return n;
}
