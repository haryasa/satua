import { Ai } from "@cloudflare/ai";
import { z, ZodObject } from "zod";

export interface RunConfig<ResponseSchema> {
  messages: Messages;
  responseSchema: ResponseSchema;
  model: ModelName;
}
export type Messages = { role: "system" | "user"; content: string }[];
export enum ModelName {
  LLAMA2_7B_FP16 = "@cf/meta/llama-2-7b-chat-fp16",
  GEMMA_7B = "@cf/google/gemma-7b-it-lora",
}

export abstract class BaseTextGenerator<ResponseSchema extends ZodObject<any>> {
  constructor(private ai: Ai) {}

  async run(
    config: RunConfig<ResponseSchema>,
  ): Promise<z.infer<ResponseSchema>> {
    const response: string = await this.runModel(config.messages, config.model);
    return this.parseResponse(response, config.responseSchema);
  }

  private async runModel(
    messages: Messages,
    model: ModelName,
  ): Promise<string> {
    // @ts-ignore: @cf/google/gemma-7b-it-lora is not assignable to ModelName
    // check periodically
    const result = (await this.ai.run(model, {
      messages,
      max_tokens: 5000,
    })) as { response?: string };
    return result.response ?? "";
  }

  private parseResponse(
    response: string,
    responseSchema: ResponseSchema,
  ): z.infer<ResponseSchema> {
    try {
      const jsonString: string = this.extractJsonString(response);
      return responseSchema.parse(JSON.parse(jsonString));
    } catch (e) {
      const message = `Failed to parse response: ${e}`;
      console.error(message);
      throw new Error(message);
    }
  }

  private extractJsonString(text: string): string {
    const jsonPattern = /{[\s\S]*}/;
    const match = RegExp(jsonPattern).exec(text);
    if (!match) throw new Error("No JSON object found in response");
    return match[0];
  }
}
