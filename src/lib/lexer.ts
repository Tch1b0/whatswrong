type LexerLanguage = "java";

export const enum Tk {
    INVALID,
    SEMICOLON,
    IDENTIFIER,
    OPERATOR,
    KEYWORD,
    TYPE,
    NUMBER,
    BRACE,
    BRACKET,
    PAREN,
    LINEBREAK,
    STRING,
    DOT,
    QUOTE,
}

export interface Token {
    t: Tk;
    value: string;
}

export interface Lexer {
    language: LexerLanguage;
    lex: (code: string) => Token[];
}
