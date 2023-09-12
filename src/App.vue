<template>
    <h1 class="text-center mt-5">What's wrong, <i>Java</i>?</h1>

    <!-- Root center Container -->
    <div class="flex justify-center mt-10">
        <!-- Root object Container -->
        <div
            class="flex justify-center flex-col gap-1 transition-all w-full overflow-auto overflow-y-clip"
        >
            <select
                name="language"
                v-model="language"
                class="p-2 bg-gray-900 text-white font-semibold rounded-md self-center transition-all w-1/8 hover:bg-gray-700 hover:cursor-pointer"
            >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
            </select>
            <!-- Textarea Container -->
            <div class="flex flex-col lg:flex-row justify-center gap-5">
                <textarea
                    name="code-area"
                    cols="70"
                    rows="30"
                    class="mono-box bg-gray-800 whitespace-pre"
                    v-model="code"
                    :placeholder="p.get('code-prompt') + '...'"
                    ref="codeTextArea"
                ></textarea>
                <div
                    v-if="output !== ''"
                    class="mono-box bg-gray-900 whitespace-nowrap"
                    v-html="output"
                ></div>
            </div>
        </div>
    </div>
    <footer class="bottom-0 w-full mt-5 text-black flex justify-center gap-2">
        {{ p.get("made-by") }} <a href="https://github.com/Tch1b0">Tch1b0</a> ||
        <a href="https://johannespour.de">Blog</a> ||
        <a href="https://github.com/Tch1b0/whatswrong">{{
            p.get("source-code")
        }}</a>
    </footer>
</template>

<script lang="ts" setup>
import { JavaLexer } from "@/lib";
import { Phraser, toCamelCase, toPascalCase, SpokenLanguage } from "@/utility";
import { Ref, ref, watch, reactive } from "vue";

const j = new JavaLexer();
const language: Ref<SpokenLanguage> = ref(
    (localStorage.getItem("preferred-language") as SpokenLanguage) ?? "en"
);
const p = new Phraser(language.value);
watch(reactive(language), () => {
    p.lang = language.value;
    localStorage.setItem("preferred-language", p.lang);
    lint();
});
const output: Ref<string> = ref("");

let codeTextArea: HTMLTextAreaElement;
const code: Ref<string> = ref("");
// execute when code is edited
watch(reactive(code), lint);

function lint() {
    console.time("lint");
    // lex the code
    const lexed = j.lex(code.value);
    // reset output
    output.value = "";

    // define writing utility
    const write = (content: string, line: number) => {
        // current line, seen from the output
        let currentLine = output.value.split("<br>").length;
        // if the current line is less/equal than the desired line
        if (currentLine <= line) {
            // append missing newlines
            while (currentLine < line) {
                output.value += "<br>";
                currentLine += 1;
            }

            output.value += content + "<br>";
        }
        // if the current line is higher than the desired one (the tricky part)
        else if (currentLine > line) {
            // place a (non-functional) cursor at the start of the output
            let cursor = 0;

            // iterate over every "<br>" and count them as newlines
            for (let i = 0; i < output.value.length - 1 - 4; i++) {
                // if the cursor is in place
                if (cursor === line) {
                    // insert the content into the line
                    output.value =
                        output.value.slice(0, i - 1) +
                        content +
                        output.value.slice(i - 1);
                    break;
                }
                // increment the cursor if a break element is selected
                if (output.value.slice(i, i + 4) === "<br>") {
                    cursor += 1;
                }
            }
        }
    };

    for (const [line, variable] of j.getVarDeclarations(lexed)) {
        const camelName = toCamelCase(variable.name);
        if (variable.name !== camelName) {
            const text = `${p.get("wrong-variable-case")} -> ${camelName}`;
            write(htmlWarn(text, line), line);
        }
    }

    for (const [line, func] of j.getFuncDeclarations(lexed)) {
        const camelName = toCamelCase(func);
        if (func !== camelName) {
            const text = `${p.get("wrong-method-case")} -> ${camelName}`;
            write(htmlWarn(text, line), line);
        }
    }

    for (const [line, name] of j.getClassDeclarations(lexed)) {
        const pascalName = toPascalCase(name);
        if (name !== pascalName) {
            const text = `${p.get("wrong-class-case")} -> ${pascalName}`;
            write(htmlWarn(text, line), line);
        }
    }

    for (const [line, _] of j.getDeepNestedCode(lexed)) {
        write(htmlWarn(p.get("deep-nested-code"), line), line);
    }

    for (const line of j.getMissingSemicolons(lexed)) {
        write(htmlError(p.get("missing-semicolon"), line), line);
    }

    console.timeEnd("lint");
}

// enable TAB in code editor
document.onkeydown = (ev: KeyboardEvent) => {
    if (ev.key === "Tab") {
        const cursorPosition = codeTextArea.selectionStart;
        code.value =
            code.value.slice(0, cursorPosition) +
            "\t" +
            code.value.slice(cursorPosition);
        ev.preventDefault();
    }
};

// wrap message in warn-style
function htmlWarn(message: string, line: number): string {
    return `<span class="output-warning">${p.get(
        "warn"
    )} ${line}: ${message}</span>`;
}

// wrap message in error-style
function htmlError(message: string, line: number): string {
    return `<span class="output-error">${p.get(
        "error"
    )} ${line}: ${message}</span>`;
}
</script>

<style>
.output-info {
    @apply text-blue-400;
}

.output-warning {
    @apply text-yellow-400;
}

.output-error {
    @apply text-red-400;
}

.mono-box {
    @apply outline-black outline-2 outline-double transition-all p-3 overflow-x-scroll overflow-y-visible text-white font-mono w-full lg:w-2/5 rounded-md selection:text-gray-700 selection:bg-gray-300;
}
</style>
