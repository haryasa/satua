import { Story } from "./story";

export class Chapter {
  constructor(
    public id: string,
    public story: Story,
    public previousChapterSummaries: string[],
    public summary: string,
    public title: string,
    public content: string,
    public suggestedActions: string[],
    public overallSummary: string,
    public generatorModel: string,
    public illustrationUrl?: string,
    public isComplete?: boolean,
  ) {}
}
