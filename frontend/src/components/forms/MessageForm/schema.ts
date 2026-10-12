import { z } from "zod";

const buildMessageTextSchema = (maxLength: number | null) =>
  z
    .string()
    .trim()
    .min(1, "This field is required.")
    .refine(
      (value) => maxLength === null || value.length <= maxLength,
      `Messages can be at most ${maxLength} characters long.`,
    );

export { buildMessageTextSchema };
