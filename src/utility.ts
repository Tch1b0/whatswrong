import english from "@/languages/en.json";
import german from "@/languages/de.json";

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

type SpokenLanguage = "en" | "de";

export class Phraser {
    private __lang: SpokenLanguage;
    text!: Record<string, string>;

    constructor(lang: SpokenLanguage) {
        this.__lang = lang;

        this.loadLang();
    }

    get lang() {
        return this.__lang;
    }

    set lang(language: SpokenLanguage) {
        this.__lang = language;
        this.loadLang();
    }

    loadLang() {
        if (this.__lang === "en") {
            this.text = english;
        } else {
            this.text = german;
        }
    }

    get(key: string): string {
        return this.text[key];
    }
}
