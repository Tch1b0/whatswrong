import { Lexer, Tk, Token } from "./lexer";
import { isIdentifier, isNumber } from "./regex";

const KEYWORDS = [
    "public",
    "private",
    "protected",
    "import",
    "class",
    "void",
    "false",
    "true",
    "static",
];

// "String" isn't a primitive type, but is listed because of it's regular usage
const TYPES = [
    "int",
    "String",
    "char",
    "byte",
    "long",
    "boolean",
    "float",
    "double",
];

export class JavaLexer implements Lexer {
    language = "java" as const;

    *getVarDeclarations(
        tokens: Token[]
    ): Generator<[number, { t: string; name: string }], void, unknown> {
        let line = 1;
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i].t == Tk.LINEBREAK) {
                line += 1;
                continue;
            }

            const items = tokens.slice(i, i + 2);
            if (items[0].t === Tk.TYPE && items[1].t === Tk.IDENTIFIER) {
                yield [line, { t: items[0].value, name: items[1].value }];
            }
        }
    }

    *getMissingSemicolons(tokens: Token[]): Generator<number, void, unknown> {
        let line = 1;
        for (let i = 1; i < tokens.length; i++) {
            const previous = tokens[i - 1];
            const current = tokens[i];
            const next = tokens.length !== i + 1 ? tokens[i + 1] : null;

            const isExcuser = (tok: string) =>
                ["{", "}", ";", "\n"].includes(tok);

            if (
                (current.t === Tk.LINEBREAK && !isExcuser(previous.value)) ||
                (!isExcuser(current.value) && next === null)
            ) {
                yield line;
            }

            if (current.t === Tk.LINEBREAK) {
                line += 1;
            }
        }
    }

    lex(code: string) {
        const tokens: Token[] = [];
        for (const line of code.split("\n")) {
            let cache = "";
            const pushTk = (tk: Tk, val = cache) => {
                tokens.push({ t: tk, value: val });
                cache = "";
            };

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                let lookahead: string = i == line.length - 1 ? "" : line[i + 1];

                if (char !== " " && char !== "\t") {
                    cache += char;
                } else {
                    continue;
                }

                switch (cache) {
                    case "==":
                    case "!=":
                    case "=":
                    case "+=":
                    case "-=":
                    case "/=":
                    case "*=":
                    case "+":
                    case "-":
                    case "*":
                    case "/": {
                        pushTk(Tk.OPERATOR);
                        break;
                    }

                    case "(":
                    case ")": {
                        pushTk(Tk.PAREN);
                        break;
                    }

                    case "[":
                    case "]": {
                        pushTk(Tk.BRACKET);
                        break;
                    }

                    case "{":
                    case "}": {
                        pushTk(Tk.BRACE);
                        break;
                    }

                    case ";": {
                        pushTk(Tk.SEMICOLON);
                        break;
                    }

                    case ".": {
                        pushTk(Tk.DOT);
                        break;
                    }

                    default: {
                        if (
                            isIdentifier(cache) &&
                            !isIdentifier(cache + lookahead)
                        ) {
                            if (KEYWORDS.includes(cache)) {
                                pushTk(Tk.KEYWORD);
                            } else if (TYPES.includes(cache)) {
                                pushTk(Tk.TYPE);
                            } else {
                                pushTk(Tk.IDENTIFIER);
                            }
                        } else if (
                            isNumber(cache) &&
                            !isNumber(cache + lookahead)
                        ) {
                            pushTk(Tk.NUMBER);
                        }
                    }
                }
            }
            tokens.push({ t: Tk.LINEBREAK, value: "\n" });
        }

        return tokens;
    }
}
