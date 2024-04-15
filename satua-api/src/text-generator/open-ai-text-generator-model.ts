import OpenAI from "openai";
import { Message, TextGeneratorModel } from "./text-generator-model";

type OpenAiModelName = "gpt-3.5-turbo" | "gpt-4-turbo";

export class OpenAiTextGeneratorModel implements TextGeneratorModel {
  constructor(
    private apiKey: string,
    private model: OpenAiModelName,
    private jsonMode: boolean = false,
  ) {}

  async run(messages: Message[]): Promise<string> {
    const openai: OpenAI = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      messages,
      model: this.model,
      response_format: { type: this.jsonMode ? "json_object" : "text" },
    });
    return completion.choices[0].message.content ?? "";
  }
}
