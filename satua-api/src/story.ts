export class Story {
  constructor(
    public keywords: string[],
    public genre: string,
    public theme: string,
    public title: string,
    public synopsis: string,
    public tone: string,
    public setting: string,
    public characters: { name: string; description: string }[],
    public pointOfView: string,
    public illustrationUrl?: string,
  ) {}
}
