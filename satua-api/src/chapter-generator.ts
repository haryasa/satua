import { Ai } from "@cloudflare/ai";
import { z } from "zod";
import { Story } from "./story";
import { BaseTextGenerator } from "./text-generator/base-text-generator";
import { Message } from "./text-generator/text-generator-model";
import { ModelName } from "./text-generator/text-generator-model-factory";

export class ChapterGenerator extends BaseTextGenerator {
  constructor(
    private ai: Ai,
    private openaiApiKey: string,
  ) {
    super();
  }

  async generateIntro(story: Story): Promise<FirstChapter> {
    const summary: FirstChapter = await this.generateIntroSummary(story);
    // const { content, title } = this.generateContent(summary, story);
    // const suggestedActions: string[] = this.generateSuggestedActions(story);
    // return this.constructChapter({
    //   summary,
    //   content,
    //   title,
    //   suggestedActions,
    //   overallSummary: summary,
    // });
    return summary;
  }

  private async generateIntroSummary(story: Story): Promise<FirstChapter> {
    return this.run({
      messages: this.constructGenerateIntroMessages(story),
      responseSchema: firstChapterSchema,
      config: {
        model: ModelName.GPT_4_TURBO,
        apiKey: this.openaiApiKey,
        jsonMode: true,
      },
    });
  }

  private constructGenerateIntroMessages(story: Story): Message[] {
    const INPUT_PROMPT: string = `
STORY_PROPERTIES:
- Title: ${story.title}
- Genre: ${story.genre}
- Theme: ${story.theme}
- Synopsis: ${story.synopsis}
- Tone: ${story.tone}
- Setting: ${story.setting}
- Characters: ${story.characters.map((c) => `${c.name}: ${c.description}`).join("\n")}
- Point of View: ${story.pointOfView}
`.trim();

    return [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: GENERATE_FIRST_CHAPTERS_PROMPT },
      { role: "user", content: INPUT_PROMPT },
    ];
  }
}

const firstChapterSchema = z.object({
  title: z.string(),
  content: z.string(),
  suggestedActions: z.array(z.string()),
});
type FirstChapter = z.infer<typeof firstChapterSchema>;

const SYSTEM_PROMPT: string = `I want you to act as a professional and creative story writer.`;

const GENERATE_FIRST_CHAPTERS_PROMPT: string = `# CONTEXT #
You are writing a medium-length story.

# OBJECTIVE #
I want you to generate the first chapter of the story. The chapter consist of title, content and suggested actions to take.
I will provide you with STORY_PROPERTIES as a reference, including the title, genre, theme, synopsis, tone, setting, characters, and point of view of the story.
The chapter should end with an open question to form a branch point for the story. Question could about what the main character should do next, which path should the main character take, what item should the main character choose, or any other question. 
The answer of the question will determine the next chapter. 
Also, provide a few suggested actions for the reader to choose from. The suggested actions should be brief and in a form of declarative sentences, not question.

Use the following guidelines when generating the first chapter:
1. The first chapter should introduce the main characters and setting.
2. The first chapter should provide a hook to keep the reader interested.
3. The total number of words should be around 250-1000 words. 

# RESPONSE #
Only response in JSON format. The JSON should contains the following fields:
- title: string
- content: string
- suggestedActions: string[]

# START GENERATING #
Start generating after I give you the STORY_PROPERTIES.`;
