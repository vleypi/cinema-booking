import { z } from "zod";
import { AGE_RATINGS, FILM_STATUSES } from "@/entities/film";
import { FILM_LIMITS, POSTER_MIME_TYPES, SAVE_FILM_TEXT } from "@/features/save-film/constants/save-film.constant";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const requiredText = (maxLength: number) => z.string().trim().min(1, SAVE_FILM_TEXT.required).max(maxLength, SAVE_FILM_TEXT.tooLong);

const isAllowedPoster = (file: File) => POSTER_MIME_TYPES.some((type) => type === file.type) && file.size <= FILM_LIMITS.posterMaxBytes;

export const filmFormSchema = z.object({
  title: requiredText(FILM_LIMITS.titleMaxLength),
  description: requiredText(FILM_LIMITS.descriptionMaxLength),
  genre: requiredText(FILM_LIMITS.genreMaxLength),
  ageRating: z.enum(AGE_RATINGS),
  durationMinutes: z
    .number({ error: SAVE_FILM_TEXT.durationRange })
    .int(SAVE_FILM_TEXT.durationRange)
    .min(1, SAVE_FILM_TEXT.durationRange)
    .max(FILM_LIMITS.durationMaxMinutes, SAVE_FILM_TEXT.durationRange),
  releaseDate: z.string().regex(DATE_PATTERN, SAVE_FILM_TEXT.dateFormat),
  isPremiere: z.boolean(),
  trailerUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/, error: SAVE_FILM_TEXT.urlFormat }).max(FILM_LIMITS.trailerUrlMaxLength, SAVE_FILM_TEXT.tooLong)]),
  status: z.enum(FILM_STATUSES),
  poster: z.instanceof(File).refine(isAllowedPoster, SAVE_FILM_TEXT.posterInvalid).nullable(),
});

export type FilmFormValues = z.infer<typeof filmFormSchema>;
