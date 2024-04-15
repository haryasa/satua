import { Story } from "./story";

export class StoryRepository {
  constructor(private db: D1Database) {}

  async save(story: Story): Promise<void> {
    const storyDb = this.serialize(story);
    await this.db
      .prepare(
        `INSERT INTO story(id, keywords, genre, theme, title, synopsis, tone, setting, characters, pointOfView) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        storyDb.id,
        storyDb.keywords,
        storyDb.genre,
        storyDb.theme,
        storyDb.title,
        storyDb.synopsis,
        storyDb.tone,
        storyDb.setting,
        storyDb.characters,
        storyDb.pointOfView,
      )
      .run();
  }

  async getAll(): Promise<Story[]> {
    const result = await this.db
      .prepare(`SELECT * FROM story`)
      .all<StoryDbDto>();
    return result.results.map((row) => this.deserialize(row));
  }

  async getById(id: string): Promise<Story | null> {
    const result = await this.db
      .prepare(`SELECT * FROM story WHERE id = ?`)
      .bind(id)
      .first<StoryDbDto>();
    return result && this.deserialize(result);
  }

  private serialize(story: Story): StoryDbDto {
    return {
      id: story.id,
      keywords: JSON.stringify(story.keywords),
      genre: story.genre,
      theme: story.theme,
      title: story.title,
      synopsis: story.synopsis,
      tone: story.tone,
      setting: story.setting,
      characters: JSON.stringify(story.characters),
      pointOfView: story.pointOfView,
      illustrationUrl: story.illustrationUrl,
    };
  }

  private deserialize(row: StoryDbDto): Story {
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
      row.illustrationUrl,
    );
  }
}

interface StoryDbDto {
  id: string;
  keywords: string;
  genre: string;
  theme: string;
  title: string;
  synopsis: string;
  tone: string;
  setting: string;
  characters: string;
  pointOfView: string;
  illustrationUrl?: string;
}
