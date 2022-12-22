<template>
    <h1 class="text-center">Whats wrong?</h1>
</template>

<script lang="ts" setup>
import { JavaLexer } from "@/lib/javalexer";

const j = new JavaLexer();

console.log(
    j.lex(`
import abcdefg;

public class Test {
  public static void main(String[] args) {
    System.out.println()
  }
}
`)
);
</script>
