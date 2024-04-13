import { Story } from "./story";

export class StoryRepository {
  constructor(private db: D1Database) {}

  async save(story: Story): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO story(id, keywords, genre, theme, title, synopsis, tone, setting, characters, pointOfView) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        story.id,
        JSON.stringify(story.keywords),
        story.genre,
        story.theme,
        story.title,
        story.synopsis,
        story.tone,
        story.setting,
        JSON.stringify(story.characters),
        story.pointOfView,
      )
      .run();
  }

  async getAll(): Promise<Story[]> {
    const result = await this.db
      .prepare(`SELECT * FROM story`)
      .all<Record<string, string>>();
    return result.results.map((row) => {
      return new Story(
        row.id,
        JSON.parse(row.keywords),
        row.genre,
        row.theme,
        row.title,
        row.synopsis,
        row.tone,
        row.setting,
        JSON.parse(row.characters),
        row.pointOfView,
      );
    });
  }
}
