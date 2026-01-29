"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDirectory = scanDirectory;
exports.analyzeForSQLInjection = analyzeForSQLInjection;
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const glob_1 = require("glob");
const openai = new openai_1.default();
async function scanDirectory(dir) {
    const files = await (0, glob_1.glob)("**/*.{js,ts,jsx,tsx,py,rb,go,java,php}", {
        cwd: dir, absolute: true, ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
    });
    const contents = [];
    for (const f of files) {
        try {
            const content = fs.readFileSync(f, "utf-8");
            if (content.length > 0 && content.length < 50000) {
                contents.push(`// File: ${f}\n${content}`);
            }
        }
        catch { }
    }
    return contents;
}
async function analyzeForSQLInjection(codeChunks) {
    const combined = codeChunks.join("\n\n").substring(0, 60000);
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a security expert specializing in SQL injection detection. Analyze the provided code for SQL injection vulnerabilities. For each finding, show the file, line context, vulnerability type, severity (critical/high/medium/low), and a fix. Be concise and actionable." },
            { role: "user", content: combined }
        ],
        temperature: 0.2,
    });
    return response.choices[0].message.content || "No issues found.";
}
