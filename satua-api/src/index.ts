import { Ai } from "@cloudflare/ai";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import packageJson from "../package.json";
import { Story } from "./story";
import { StoryGenerator } from "./story-generator";
import { StoryRepository } from "./story-repository";

type Bindings = {
  AI: Ai;
  DB: D1Database;
};

const generateStoryDtoSchema = z.object({
  seed: z.string(),
});
type GenerateStoryDto = z.infer<typeof generateStoryDtoSchema>;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({
    name: "Satua API",
    version: packageJson.version,
    status: "ok",
  });
});

app.post("/generate", zValidator("json", generateStoryDtoSchema), async (c) => {
  const generateStoryDto: GenerateStoryDto = c.req.valid("json");
  const storyGenerator: StoryGenerator = new StoryGenerator(c.env.AI);
  const storyRepository: StoryRepository = new StoryRepository(c.env.DB);
  const story: Story = await storyGenerator.generate(generateStoryDto.seed);
  await storyRepository.save(story);
  return c.json(story);
});

app.get("/stories", async (c) => {
  const storyRepository: StoryRepository = new StoryRepository(c.env.DB);
  const stories: Story[] = await storyRepository.getAll();
  return c.json(stories);
});

export default app;
