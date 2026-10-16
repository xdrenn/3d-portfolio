const BASE_URL = import.meta.env.BASE_URL;

export const projectImageUrl = (name: string) => `${BASE_URL}images/${name}.webp`;

export const projectThumbnailUrl = (name: string) => `${BASE_URL}images/thumbs/${name}.webp`;

export const projectVideoSources = (name: string) => [
  { src: `${BASE_URL}videos/${name}.webm`, type: "video/webm" },
  { src: `${BASE_URL}videos/${name}.mp4`, type: "video/mp4" },
];
