#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const index_1 = require("./index");
const program = new commander_1.Command();
program
    .name("ai-sql-check")
    .description("Detect SQL injection vulnerabilities using AI")
    .version("1.0.0")
    .argument("[directory]", "Directory to scan", ".")
    .action(async (directory) => {
    const spinner = (0, ora_1.default)("Scanning for SQL injection vulnerabilities...").start();
    try {
        const codeChunks = await (0, index_1.scanDirectory)(directory);
        if (codeChunks.length === 0) {
            spinner.warn("No source files found.");
            return;
        }
        spinner.text = `Analyzing ${codeChunks.length} file(s) with AI...`;
        const analysis = await (0, index_1.analyzeForSQLInjection)(codeChunks);
        spinner.succeed("SQL Injection Analysis Complete:");
        console.log(`\n${analysis}`);
    }
    catch (err) {
        spinner.fail(`Error: ${err.message}`);
        process.exit(1);
    }
});
program.parse();
