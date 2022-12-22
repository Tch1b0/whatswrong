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
const TYPES = ["int", "String", "char", "byte", "long", "boolean"];

export class JavaLexer implements Lexer {
    language = "java" as const;

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

                if (char !== " ") {
                    cache += char;
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
