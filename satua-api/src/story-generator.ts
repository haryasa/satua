import { Ai } from "@cloudflare/ai";
import { z } from "zod";
import { Story } from "./story";

type Messages = { role: "system" | "user"; content: string }[];

export class StoryGenerator {
  constructor(private ai: Ai) {}

  async generate(seedWord: string): Promise<Story> {
    console.log(`Generating story for seed word: ${seedWord}`);
    const messages: Messages = this.constructMessages(seedWord);
    const response: string = await this.runLlm(messages);
    const json: StoryResponse = this.parseResponse(response);
    return this.constructStory(json);
  }

  private constructMessages(seedWord: string): Messages {
    return [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: COMMAND_PROMPT },
      { role: "user", content: `Seed word: ${seedWord}` },
    ];
  }

  private async runLlm(messages: Messages): Promise<string> {
    const result = (await this.ai.run("@cf/google/gemma-7b-it-lora", {
      messages,
      max_tokens: 5000,
    })) as { response?: string };
    return result.response ?? "";
  }

  private parseResponse(response: string): StoryResponse {
    try {
      const jsonString: string = this.extractJsonString(response);
      return ResponseSchema.parse(JSON.parse(jsonString));
    } catch (e) {
      throw new Error(`Failed to parse response: ${e}`);
    }
  }

  private extractJsonString(text: string): string {
    const jsonPattern = /{[\s\S]*}/;
    const match = RegExp(jsonPattern).exec(text);
    if (!match) throw new Error("No JSON object found in response");
    return match[0];
  }

  private constructStory(json: StoryResponse): Story {
    return new Story(
      json.keywords,
      json.genre,
      json.theme,
      json.title,
      json.synopsis,
      json.tone,
      json.setting,
      json.characters,
      json.pointOfView,
    );
  }
}

const ResponseSchema = z.object({
  keywords: z.array(z.string()),
  genre: z.string(),
  theme: z.string(),
  title: z.string(),
  synopsis: z.string(),
  tone: z.string(),
  setting: z.string(),
  characters: z.array(z.object({ name: z.string(), description: z.string() })),
  pointOfView: z.string(),
});

type StoryResponse = z.infer<typeof ResponseSchema>;

const SYSTEM_PROMPT: string = `I want you to act as a professional and creative writer.`;

const COMMAND_PROMPT: string = `# OBJECTIVE #
I want you to create an engaging story idea. Use these step-by-step process:

1. SEED: I will provide you with a seed word.
2. KEYWORDS: Expand [SEED] into keywords by adding other related words. Make around 5-10 keywords.

Generate the following metadata for each story, based on [KEYWORDS]:
3. GENRE: Think about the genre of the story. What type of story are you creating?
4. THEME: What is the central theme of the story?
5. TITLE: Create a title for the story.
6. SYNOPSIS: A brief summary of the story, highlighting the key elements and what the story is about in a way that captures the reader's interest. Make it around 2-3 sentences.
7. TONE: What is the tone of the story?
8. SETTING: Describe the setting of the story.
9. CHARACTERS: Create a list of characters, including their names and descriptions. List as many characters as you think are necessary. 
10. POINT_OF_VIEW: What is the point of view of the story?

# RESPONSE #
Only response in JSON format. The JSON should contain the following fields:
- keywords: string[]
- genre: string
- theme: string
- title: string
- synopsis: string
- tone: string
- setting: string
- characters: { name: string, description: string }[]
- pointOfView: string`;
