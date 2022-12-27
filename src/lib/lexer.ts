// LexerLanguage lists the different lexers available, which currently is just java
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
    COMMA,
}

export interface Token {
    t: Tk;
    value: string;
}

export interface Lexer {
    language: LexerLanguage;
    lex: (code: string) => Token[];
}
