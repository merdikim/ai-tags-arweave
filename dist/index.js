"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTags = void 0;
require("dotenv/config");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const providerConfigs = {
    openai: {
        model: "openai/gpt-oss-20b",
    },
};
const generateTags = async (data) => {
    try {
        const dataString = dataToString(data);
        const llmTags = await callLLM(dataString);
        return llmTags;
    }
    catch (error) {
        throw new Error(`Failed to generate tags: ${error}`);
    }
};
exports.generateTags = generateTags;
const dataToString = (data) => {
    if (typeof data === "string") {
        return data;
    }
    if (typeof data === "object") {
        try {
            return JSON.stringify(data, null, 2);
        }
        catch {
            return data.toString();
        }
    }
    return String(data);
};
// Call LLM to analyze data and generate tags
const callLLM = async (dataString) => {
    const prompt = buildPrompt(dataString);
    const chat = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are an expert at analyzing data and generating relevant tags for Arweave storage. Always respond with valid JSON only.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        model: providerConfigs["openai"].model,
    });
    const content = chat.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No response from LLM");
    }
    return validateTags(JSON.parse(content));
};
// Build prompt for LLM based on data and options
const buildPrompt = (dataString) => {
    const maxTags = 20;
    const basePrompt = `Analyze the following data and generate relevant tags for Arweave storage.

    Data to analyze:
    ${dataString.slice(0, 2000)}${dataString.length > 2000 ? "..." : ""}

    Generate up to ${maxTags} tags that would be useful for:
    - Searching and discovering this data
    - Categorizing the content
    - Understanding the data type and purpose
    - Organizing related content

    Return your response as a JSON array of objects with "name" and "value" properties.
    Example format: [{"name": "Content-Type", "value": "text/plain"}, {"name": "Category", "value": "documentation"}]

    Guidelines:
    - Use descriptive but concise tag names
    - Values should be specific and searchable
    - Include semantic tags (topic, purpose, domain)
    - Include technical tags (format, type, structure)
    - Use standard naming conventions when possible
    - Avoid overly generic tags like "data" or "file"
    - Ensure all tags are relevant to the content

    Only return valid JSON. Do not include any explanations or additional text.
  `;
    return basePrompt;
};
// Validate and sanitize tags from LLM response
const validateTags = (tags) => {
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .filter((tag) => tag &&
        typeof tag === "object" &&
        typeof tag.name === "string" &&
        typeof tag.value === "string" &&
        tag.name.trim() &&
        tag.value.trim())
        .map((tag) => ({
        name: tag.name.trim(),
        value: tag.value.trim(),
    }))
        .slice(0, 20); // Safety limit to only return max 20 tags
};
// const log = async () => {
//   const data = "This is a test to see if it works. This should generate tags.";
//   const tags = await generateTags(data);
//   console.log("Generated Tags:", tags);
// };
// log();
const app = (0, express_1.default)();
const port = process.env.PORT || 9090;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/generate-tags", async (req, res) => {
    try {
        const data = req.body.text;
        if (!data) {
            return res.status(400).json({ error: "Missing 'data' in request body." });
        }
        const tags = await (0, exports.generateTags)(data);
        console.log(tags);
        res.status(200).json({ tags });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
