import { z, ZodType } from "zod";
import { Message, TextGeneratorModel } from "./text-generator-model";
import {
  TextGeneratorConfig,
  TextGeneratorModelFactory,
} from "./text-generator-model-factory";

export interface RunRequest<ResponseSchema> {
  messages: Message[];
  responseSchema: ResponseSchema;
  config: TextGeneratorConfig;
}

export abstract class BaseTextGenerator {
  async run<
    ResponseSchema extends ZodType,
    ResponseType extends z.infer<ResponseSchema>,
  >(request: RunRequest<ResponseSchema>): Promise<ResponseType> {
    const response: string = await this.runModel(
      request.messages,
      request.config,
    );
    console.debug("Raw response:", response);

    const parsedResponse: ResponseType = this.parseResponse(
      response,
      request.responseSchema,
    );
    console.debug("Parsed response:", parsedResponse);

    return parsedResponse;
  }

  private async runModel(
    messages: Message[],
    config: TextGeneratorConfig,
  ): Promise<string> {
    const modelFactory: TextGeneratorModelFactory =
      new TextGeneratorModelFactory();
    const model: TextGeneratorModel = modelFactory.create(config);
    return model.run(messages);
  }

  private parseResponse<
    ResponseSchema extends ZodType,
    ResponseType extends z.infer<ResponseSchema>,
  >(response: string, responseSchema: ResponseSchema): ResponseType {
    const jsonString: string = this.extractJsonObjectFromString(response);
    return responseSchema.parse(JSON.parse(jsonString));
  }

  private extractJsonObjectFromString(text: string): string {
    const jsonPattern = /{[\s\S]*}/;
    const match = RegExp(jsonPattern).exec(text);
    if (!match) throw new Error("No JSON object found in response");
    return match[0];
  }
}
