export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface TextGeneratorModel {
  run(messages: Message[]): Promise<string>;
}
