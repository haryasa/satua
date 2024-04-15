import { Ai } from "@cloudflare/ai";
import { CloudflareTextGeneratorModel } from "./cloudflare-text-generator-model";
import { OpenAiTextGeneratorModel } from "./open-ai-text-generator-model";
import { TextGeneratorModel } from "./text-generator-model";

export enum ModelName {
  LLAMA_2_7B_FP16 = "@cf/meta/llama-2-7b-chat-fp16",
  GEMMA_7B = "@cf/google/gemma-7b-it-lora",
  MISTRAL_7B_INSTRUCT = "@cf/mistral/mistral-7b-instruct-v0.1",
  GPT_35_TURBO = "gpt-3.5-turbo",
}

export interface CloudflareTextGeneratorConfig {
  model:
    | ModelName.LLAMA_2_7B_FP16
    | ModelName.GEMMA_7B
    | ModelName.MISTRAL_7B_INSTRUCT;
  aiBinding: Ai;
}

export interface OpenAiTextGeneratorConfig {
  model: ModelName.GPT_35_TURBO;
  apiKey: string;
  jsonMode?: boolean;
}

export type TextGeneratorConfig =
  | CloudflareTextGeneratorConfig
  | OpenAiTextGeneratorConfig;

export class TextGeneratorModelFactory {
  create(config: TextGeneratorConfig): TextGeneratorModel {
    switch (config.model) {
      case ModelName.LLAMA_2_7B_FP16:
      case ModelName.GEMMA_7B:
      case ModelName.MISTRAL_7B_INSTRUCT:
        return new CloudflareTextGeneratorModel(config.aiBinding, config.model);
      case ModelName.GPT_35_TURBO:
        return new OpenAiTextGeneratorModel(
          config.apiKey,
          config.model,
          config.jsonMode,
        );
    }
  }
}
