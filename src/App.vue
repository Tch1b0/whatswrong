<template>
    <h1 class="text-center mt-5">Whats wrong, Java?</h1>
    <!-- Root center Container -->
    <div class="flex justify-center mt-14">
        <!-- Root object Container -->
        <div class="flex justify-center flex-col gap-1 transition-all w-full">
            <!-- Textarea Container -->
            <div class="flex flex-col lg:flex-row justify-center gap-5">
                <textarea
                    name="code-area"
                    cols="70"
                    rows="30"
                    class="outline-black transition-all overflow-x-scroll overflow-y-auto outline-2 outline-double bg-gray-800 resize-none text-white p-5 font-mono rounded-md w-3/4 lg:w-1/3"
                    v-model="code"
                    placeholder="Enter your code here..."
                    ref="codeTextArea"
                ></textarea>
                <div
                    v-if="output !== ''"
                    class="outline-black outline-2 transition-all p-3 overflow-x-scroll whitespace-nowrap text-white font-mono outline-double bg-gray-800 w-3/4 lg:w-1/3 rounded-md"
                    v-html="output"
                ></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { JavaLexer } from "@/lib";
import { Ref, ref, watch, reactive } from "vue";

const j = new JavaLexer();
let codeTextArea: HTMLTextAreaElement;
const code: Ref<string> = ref("");
watch(reactive(code), () => {
    const lexed = j.lex(code.value);
    output.value = "<br><br><br><br><br><br><br>";

    const write = (content: string, line: number) => {
        let currentLine = output.value.split("<br>").length;
        console.log(currentLine, line);
        if (currentLine <= line) {
            while (currentLine < line) {
                output.value += "<br>";
                currentLine += 1;
            }

            output.value += content + "<br>";
        } else if (currentLine > line) {
            let cursor = 0;
            for (let i = 0; i < output.value.length - 1 - 4; i++) {
                const seperatorComma = () =>
                    output.value[i - 2] !== ">" ? "" : ", ";

                if (cursor === line) {
                    output.value =
                        output.value.slice(0, i - 1) +
                        seperatorComma() +
                        content +
                        output.value.slice(i - 1);
                    break;
                }
                if (output.value.slice(i, i + 4) === "<br>") {
                    console.log(cursor);
                    cursor += 1;
                }
            }
        }
    };

    for (const [line, variable] of j.getVarDeclarations(lexed)) {
        if (variable.name.toLowerCase()[0] !== variable.name[0]) {
            write(htmlWarn(`declare variables in camelCase`, line), line);
        }
    }
});

const output: Ref<string> = ref("");

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

function htmlWarn(text: string, line: number): string {
    return `<span class="output-warning">Warning in line ${line}: ${text}</span>`;
}

function htmlError(text: string, line: number): string {
    return `<span class="output-error">Error in line ${line}: ${text}</span>`;
}
</script>

<style>
.output-warning {
    @apply text-yellow-400;
}

.output-error {
    @apply text-red-400;
}
</style>
