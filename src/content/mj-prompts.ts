export const FREEME_STYLE_BASE = `editorial portrait photograph, warm maternal atmosphere, fixed palette: deep terracotta #8C4A36, soft cream #FBF4EC, warm sand #F3E4D6, sage green #7D8A6A, charcoal #2E241D; allowed materials: raw linen, warm wool, terracotta ceramics, dried flowers, natural wood; soft oblique golden hour light, gentle chiaroscuro, shallow depth of field; no text, no logos, no watermarks; 8k`;

export interface MJPrompt {
  prompt: string;
  slideIndex: number;
  usage: "background" | "split-top";
}

export const MJ_PROMPTS: Record<number, MJPrompt[]> = {
  1: [
    { prompt: "close up of a mother's hands gently touching a sleeping child's hair, warm terracotta tones, soft golden hour light, intimate, film grain, shallow depth of field --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman sitting alone on bed, morning light through curtains, cream tones, pensive, viewed from behind, warm atmosphere --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  2: [
    { prompt: "silhouette of a woman standing at a window at dusk, warm terracotta interior light, contemplative, film grain, emotional --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  3: [
    { prompt: "overhead shot of a woman's desk covered in lists, calendars, children's drawings, half-drunk coffee, warm natural light, overwhelm visible --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman carrying grocery bags while holding a child's hand, urban setting, warm earth tones, documentary style, golden hour --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  4: [
    { prompt: "woman's reflection in a dark window at night, warm interior behind her, tired eyes, curly hair, glasses, intimate portrait --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  5: [
    { prompt: "empty glass on a wooden table, last drop of water, warm afternoon light, still life, terracotta background, melancholy beauty --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman with closed eyes, hands on her own shoulders, self-embrace, warm cream sweater, soft light, tender, film grain --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  6: [
    { prompt: "two hands intertwined, one holding tight one releasing, warm golden light, close up, emotional, terracotta tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  7: [
    { prompt: "smartphone on cream linen fabric showing warm terracotta app interface, overhead shot, candle nearby, intimate setting --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman looking at phone screen, warm glow on face, soft smile, evening light, curly hair, intimate moment --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  8: [
    { prompt: "close up of a woman's face with tears, not sad but relieved, warm light, terracotta earthy tones, raw emotion, beautiful --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "mother setting down heavy bags at front door, exhaling, warm hallway light, documentary style --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  9: [
    { prompt: "woman looking out window with hand on glass, rain outside, warm interior, pensive, curly hair, glasses, intimate --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  10: [
    { prompt: "woman hiding face behind hands, one eye visible through fingers, warm terracotta background, vulnerability, portrait --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "cracked porcelain mask on cream linen, golden light shining through cracks, kintsugi concept, still life --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  11: [
    { prompt: "old photograph held by modern hands, mother and daughter, sepia faded, warm light on the hands, nostalgia --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  12: [
    { prompt: "closed fist slowly opening, nothing inside, warm golden light from the side, close up, emotional release --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman exhaling deeply, eyes closed, wind in curly hair, warm outdoor light, freedom, letting go --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  13: [
    { prompt: "woman alone in empty room, standing, looking at light coming through door, warm terracotta walls, contemplative --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  14: [
    { prompt: "seven smooth stones arranged on cream fabric, each a different earth tone, overhead shot, warm natural light, minimal --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman writing in journal at wooden table, close up on hands and pen, warm morning light, intimate --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  15: [
    { prompt: "three generations of women, grandmother mother daughter, warm earth tones, slightly out of focus, golden hour, emotional --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "old family photograph on a wooden shelf, warm afternoon light, dust particles visible, nostalgia --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  16: [
    { prompt: "woman walking away on a warm lit path, confident stride, terracotta earth, golden hour, back to camera --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  17: [
    { prompt: "hands gently placing a stone on the ground, act of releasing, warm light, earth tones, close up --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "balance scale, one side heavy with stones, other side light with a feather, warm still life, conceptual --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  18: [
    { prompt: "confident Black woman with curly hair and glasses, terracotta blazer, looking directly at camera, warm background, professional portrait --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  19: [
    { prompt: "mirror reflecting a real woman, messy hair, tired eyes, but beautiful in her truth, warm bathroom light, intimate --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "list written on paper, items crossed out and rewritten, warm desk light, close up, transformation visible --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  20: [
    { prompt: "woman planting feet firmly on warm earth, roots growing concept, ground level shot, terracotta soil, grounding --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  21: [
    { prompt: "before and after concept, left side heavy dark, right side light and warm, split composition, transformation --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman reading her own handwritten journal, smile of recognition, warm lamp light, intimate moment --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  22: [
    { prompt: "woman at kitchen table surrounded by family obligations, bills, school papers, phone, overwhelmed but composed, warm tones --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "sandwich metaphor, woman between two generations, elderly parent and child pulling her, warm documentary style --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  23: [
    { prompt: "alarm clock showing 3am, soft blue moonlight, blurred woman in bed in background, insomnia, intimate night scene --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  24: [
    { prompt: "mother and daughter facing each other, not touching, emotional distance visible, warm but melancholic light --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "two paths diverging in warm autumn forest, golden leaves, choice, journey metaphor --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  25: [
    { prompt: "woman receiving a cup of tea from another pair of hands, close up, act of receiving, warm light, tenderness --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  26: [
    { prompt: "smartphone showing FreeMe app on warm wooden desk, journal and pen beside it, candle, lifestyle product shot --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman doing the diagnostic on phone, concentrated, warm evening light, living room, lifestyle --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  27: [
    { prompt: "woman speaking directly to camera, warm terracotta background, confident, intimate, as if talking to a friend --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  28: [
    { prompt: "handwritten letter on cream paper, warm light, pen resting on it, emotional, personal, close up --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman writing with determination, warm desk, morning light, close up on face and paper --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  29: [
    { prompt: "cracked perfect porcelain figure with golden light shining through cracks, kintsugi concept, warm terracotta tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  30: [
    { prompt: "woman walking towards camera on a warm lit path, at peace, arms slightly open, golden hour, terracotta earth --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "sunrise over calm landscape, warm terracotta and gold, new beginning, hope, minimal --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
};
