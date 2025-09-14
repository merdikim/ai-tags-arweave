import "dotenv/config";
import Groq from "groq-sdk";
import { Tag } from "./types";
import express from "express";
import cors from "cors";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const providerConfigs = {
  openai: {
    model: "openai/gpt-oss-20b",
  },
};

export const generateTags = async (data: any): Promise<Tag[]> => {
  try {
    
    const dataString = dataToString(data);
    const llmTags = await callLLM(dataString);
    return llmTags;
  } catch (error) {
    throw new Error(`Failed to generate tags: ${error}`);
  }
};

const dataToString = (data: any): string => {
  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object") {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return data.toString();
    }
  }

  return String(data);
};

// Call LLM to analyze data and generate tags
const callLLM = async (dataString: string): Promise<Tag[]> => {
  const prompt = buildPrompt(dataString);

  const chat = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at analyzing data and generating relevant tags for Arweave storage. Always respond with valid JSON only.",
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
const buildPrompt = (dataString: string): string => {
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
const validateTags = (tags: any[]): Tag[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter(
      (tag) =>
        tag &&
        typeof tag === "object" &&
        typeof tag.name === "string" &&
        typeof tag.value === "string" &&
        tag.name.trim() &&
        tag.value.trim(),
    )
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

const app = express();
const port = process.env.PORT || 9090;

app.use(express.json());
app.use(cors());

app.post("/generate-tags", async (req:any, res:any) => {

  try {
    const data = req.body.text;
    if (!data) {
      return res.status(400).json({ error: "Missing 'data' in request body." });
    }
    const tags = await generateTags(data);
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
