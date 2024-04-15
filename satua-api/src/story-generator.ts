import { Ai } from "@cloudflare/ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { BaseTextGenerator } from "./base-text-generator";
import { Story } from "./story";
import { ModelName } from "./text-generator-model-factory";

type Messages = { role: "system" | "user"; content: string }[];

export class StoryGenerator extends BaseTextGenerator {
  constructor(
    private ai: Ai,
    private openaiApiKey: string,
  ) {
    super();
  }

  async generate(seedWord: string): Promise<Story> {
    console.log(`Generating story for seed word: ${seedWord}`);
    const json: StoryResponse = await this.run({
      messages: this.constructMessages(seedWord),
      responseSchema: storyResponseSchema,
      config: {
        model: ModelName.GPT_35_TURBO,
        apiKey: this.openaiApiKey,
        jsonMode: true,
      },
    });
    return this.constructStory(json);
  }

  private constructMessages(seedWord: string): Messages {
    return [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: COMMAND_PROMPT },
      { role: "user", content: `Seed word: ${seedWord}` },
    ];
  }

  private constructStory(json: StoryResponse): Story {
    return new Story(
      uuidv4(),
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

const storyResponseSchema = z.object({
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
type StoryResponse = z.infer<typeof storyResponseSchema>;

const SYSTEM_PROMPT: string = `I want you to act as a professional and creative story writer.`;

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
Only response in JSON format. The JSON should contains the following fields:
- keywords: string[]
- genre: string
- theme: string
- title: string
- synopsis: string
- tone: string
- setting: string
- characters: { name: string, description: string }[]
- pointOfView: string

# START GENERATING #
Start generating after I give you the seed word.`;
