import { Ai } from "@cloudflare/ai";
import { Message, TextGeneratorModel } from "./text-generator-model";

type CloudflareModelName =
  | "@cf/meta/llama-2-7b-chat-fp16"
  | "@cf/google/gemma-7b-it-lora"
  | "@cf/mistral/mistral-7b-instruct-v0.1";

export class CloudflareTextGeneratorModel implements TextGeneratorModel {
  constructor(
    private ai: Ai,
    private model: CloudflareModelName,
  ) {}

  async run(messages: Message[]): Promise<string> {
    // @ts-ignore: @cf/google/gemma-7b-it-lora is not assignable to ModelName
    const result = (await this.ai.run(this.model, {
      messages,
      max_tokens: 5000,
    })) as { response?: string };
    return result.response ?? "";
  }
}
