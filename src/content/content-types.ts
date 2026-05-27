export interface ContentSlide {
  layout: string;
  body: string;
  bold?: string[];
}

export interface ContentPost {
  day: number;
  slot: "morning" | "evening";
  time: string;
  type: "carousel" | "video";
  categoria: string;
  title: string;
  slides: ContentSlide[];
  caption: string;
  hashtags: string;
  platforms: string[];
}
