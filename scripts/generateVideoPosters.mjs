import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, extname, join, parse, resolve } from "node:path";

const VIDEO_EXTENSION = ".mp4";
const CONTENT_DIRECTORY = resolve("src/content/blog");

const collectVideoPaths = (directory) => {
  const videoPaths = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      videoPaths.push(...collectVideoPaths(entryPath));
      continue;
    }

    if (extname(entry.name).toLowerCase() === VIDEO_EXTENSION)
      videoPaths.push(entryPath);
  }

  return videoPaths;
};

const getVideoPaths = (requestedPaths) => {
  if (!requestedPaths.length) return collectVideoPaths(CONTENT_DIRECTORY);

  const videoPaths = [];
  for (const requestedPath of requestedPaths)
    videoPaths.push(resolve(requestedPath));
  return videoPaths;
};

const getPosterPath = (videoPath) => {
  const { dir, name } = parse(videoPath);
  return join(dir, "posters", `${name}.webp`);
};

const generatePoster = (videoPath) => {
  const posterPath = getPosterPath(videoPath);

  if (existsSync(posterPath)) {
    console.log(`exists ${posterPath}`);
    return;
  }

  mkdirSync(dirname(posterPath), { recursive: true });

  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-c:v",
      "libwebp",
      "-quality",
      "80",
      "-compression_level",
      "6",
      posterPath,
    ],
    { encoding: "utf8" },
  );

  if (result.error) {
    throw new Error(
      "FFmpeg is required to generate video posters. Install it and retry.",
      { cause: result.error },
    );
  }

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `Could not process ${videoPath}`);
  }

  console.log(`generated ${posterPath}`);
};

for (const videoPath of getVideoPaths(process.argv.slice(2))) {
  generatePoster(videoPath);
}
