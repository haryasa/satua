import { Ai } from "@cloudflare/ai";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import packageJson from "../package.json";
import { Story } from "./story";
import { StoryGenerator } from "./story-generator";

type Bindings = {
  AI: Ai;
};

const GenerateStoryDto = z.object({
  seed: z.string(),
});
type GenerateStoryDto = z.infer<typeof GenerateStoryDto>;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({
    name: "Satua API",
    version: packageJson.version,
    status: "ok",
  });
});

app.post("/generate", zValidator("json", GenerateStoryDto), async (c) => {
  const generateStoryDto: GenerateStoryDto = c.req.valid("json");
  const storyGenerator: StoryGenerator = new StoryGenerator(c.env.AI);
  const story: Story = await storyGenerator.generate(generateStoryDto.seed);
  return c.json(story);
});

export default app;
