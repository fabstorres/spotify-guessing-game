import { Result } from "@fabstack/justresults";

const timeout = 5000; // 5 seconds

import { z } from 'zod';

const ImageSchema = z.object({
    url: z.url(),
    height: z.number().int().nullable(),
    width: z.number().int().nullable(),
});

const ExternalUrlsSchema = z.object({
    spotify: z.url(),
});

export const SpotifyUserSchema = z.object({
    display_name: z.string().nullable(),
    external_urls: ExternalUrlsSchema,
    followers: z.object({
        href: z.url().nullable(),
        total: z.number().int(),
    }),
    href: z.url(),
    id: z.string(),
    images: z.array(ImageSchema),
    type: z.literal('user'),
    uri: z.string(),
});

export type SpotifyUser = z.infer<typeof SpotifyUserSchema>;

const SimplifiedArtistSchema = z.object({
    external_urls: ExternalUrlsSchema,
    href: z.url(),
    id: z.string(),
    name: z.string(),
    type: z.literal('artist'),
    uri: z.string(),
});

const SimplifiedAlbumSchema = z.object({
    album_type: z.enum(['album', 'single', 'compilation']),
    total_tracks: z.number().int(),
    available_markets: z.array(z.string()), // ISO 3166-1 alpha-2 country codes
    external_urls: ExternalUrlsSchema,
    href: z.url(),
    id: z.string(),
    images: z.array(ImageSchema),
    name: z.string(),
    release_date: z.string(),
    release_date_precision: z.enum(['year', 'month', 'day']),
    type: z.literal('album'),
    uri: z.string(),
    artists: z.array(SimplifiedArtistSchema),
});

// --- Main Track Schema ---

export const TrackSchema = z.object({
    album: SimplifiedAlbumSchema,
    artists: z.array(SimplifiedArtistSchema),
    available_markets: z.array(z.string()),
    disc_number: z.number().int(),
    duration_ms: z.number().int(),
    explicit: z.boolean(),
    external_ids: z.object({
        isrc: z.string().optional(),
        ean: z.string().optional(),
        upc: z.string().optional(),
    }).optional(), // external_ids can sometimes be empty or missing fields
    external_urls: ExternalUrlsSchema,
    href: z.url(),
    id: z.string(),
    is_local: z.boolean(),
    name: z.string(),
    popularity: z.number().int().min(0).max(100),
    preview_url: z.url().nullable(), // Null if no preview is available
    track_number: z.number().int(),
    type: z.literal('track'),
    uri: z.string(),
});

// --- Top Items (Paging) Response ---

export const TopTracksResponseSchema = z.object({
    href: z.url(),
    limit: z.number().int(),
    next: z.url().nullable(),
    offset: z.number().int(),
    previous: z.url().nullable(),
    total: z.number().int(),
    items: z.array(TrackSchema),
});

export type TopTracksResponse = z.infer<typeof TopTracksResponseSchema>;

export const Spotify = {
    getUserData: async (access_token: string) => {
        try {
            const res = await fetch("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                signal: AbortSignal.timeout(timeout)
            });
            if (!res.ok) {
                return Result.fail("Failed to fetch user data")
            }

            const data = await res.json();

            const validatedData = SpotifyUserSchema.safeParse(data);
            if (!validatedData.success) {
                return Result.fail("Failed to validate user data")
            }

            return Result.ok(validatedData.data);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            return Result.fail(msg)
        }
    },
    getUserTopTracks: async (access_token: string) => {
        try {
            const res = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=25", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                signal: AbortSignal.timeout(timeout)
            });
            if (!res.ok) {
                return Result.fail("Failed to fetch user top tracks")
            }

            const data = await res.json();

            const validatedData = TopTracksResponseSchema.safeParse(data);
            if (!validatedData.success) {
                return Result.fail("Failed to validate user top tracks")
            }

            return Result.ok(validatedData.data);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            return Result.fail(msg)
        }
    }
} as const