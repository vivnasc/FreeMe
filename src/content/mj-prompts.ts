export const FREEME_STYLE_BASE = `editorial portrait photograph, warm maternal atmosphere, fixed palette: deep terracotta #8C4A36, soft cream #FBF4EC, warm sand #F3E4D6, sage green #7D8A6A, charcoal #2E241D; allowed materials: raw linen, warm wool, terracotta ceramics, dried flowers, natural wood; soft oblique golden hour light, gentle chiaroscuro, shallow depth of field; no text, no logos, no watermarks; 8k`;

export interface MJPrompt {
  prompt: string;
  slideIndex: number;
  usage: "background" | "split-top";
}

export type SlotKey = `${number}-morning` | `${number}-evening`;

// Indexed by `${day}-${slot}` so each of the 60 posts has its own prompts.
// Carousels: 2 prompts (capa + interior). Videos: 1 prompt (background).
export const MJ_PROMPTS: Record<string, MJPrompt[]> = {
  // === SEMANA 1 ===
  "1-morning": [
    { prompt: "close up of a mother's hands gently touching a sleeping child's hair, warm terracotta tones, soft golden hour light, intimate, film grain, shallow depth of field --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman sitting alone on bed, morning light through curtains, cream tones, pensive, viewed from behind, warm atmosphere --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "1-evening": [
    { prompt: "silhouette of a woman by window at dusk, warm terracotta interior light, contemplative, film grain, emotional, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "2-morning": [
    { prompt: "exhausted mother juggling laptop, child's drawing and coffee on kitchen table, warm afternoon light, documentary style, sense of impossible balance --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "2-evening": [
    { prompt: "woman holding a fragile smile in front of mirror, warm bathroom light, intimate, vulnerability behind composure --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "back of woman sitting on floor against bedroom wall, child's toy beside her, warm side light, emotional silence --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "3-morning": [
    { prompt: "overhead shot of a woman's desk covered in lists, calendars, children's drawings, half-drunk coffee, warm natural light, overwhelm visible --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman carrying grocery bags while holding a child's hand, urban setting, warm earth tones, documentary style, golden hour --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "3-evening": [
    { prompt: "woman's hands counting on fingers in warm low light, close up, list-like gesture, vertical composition, terracotta tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "4-morning": [
    { prompt: "woman's reflection in a dark window at night, warm interior behind her, tired eyes, curly hair, glasses, intimate portrait --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "4-evening": [
    { prompt: "woman's hands resting on a table holding the weight of family papers and bills, overhead shot, warm light, weight visible --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "single feather floating slowly above outstretched hand, warm minimal background, release metaphor, terracotta tones --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "5-morning": [
    { prompt: "empty glass on a wooden table, last drop of water, warm afternoon light, still life, terracotta background, melancholy beauty --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman with closed eyes, hands on her own shoulders, self-embrace, warm cream sweater, soft light, tender, film grain --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "5-evening": [
    { prompt: "woman alone with cup of tea at dusk, soft window light, warm cream tones, gentle quietness, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "6-morning": [
    { prompt: "woman lying on couch in afternoon light, eyes open but exhausted, cream blanket, sense of depletion beyond sleep, warm tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "6-evening": [
    { prompt: "mother kneeling to be at child's eye level, warm window light, presence and tenderness, full body intact, terracotta tones --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "single tall candle burning steady in cream room, no wind, golden flame, metaphor for staying whole, still life --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "7-morning": [
    { prompt: "smartphone on cream linen fabric showing warm terracotta app interface, overhead shot, candle nearby, intimate setting --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman looking at phone screen, warm glow on face, soft smile, evening light, curly hair, intimate moment --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "7-evening": [
    { prompt: "open hand reaching toward warm light, simple symbolic invitation, terracotta backdrop, minimalist still life --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "close up of finger about to tap phone, warm screen glow on hand, intimate, golden hour interior --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  // === SEMANA 2 ===
  "8-morning": [
    { prompt: "close up of a woman's face with tears, not sad but relieved, warm light, terracotta earthy tones, raw emotion, beautiful --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "mother setting down heavy bags at front door, exhaling, warm hallway light, documentary style --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "8-evening": [
    { prompt: "child reaching upward, mother's outline visible but soft, warm window light, intimate dynamic, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "9-morning": [
    { prompt: "woman looking out window with hand on glass, rain outside, warm interior, pensive, curly hair, glasses, intimate --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "9-evening": [
    { prompt: "untouched cup of tea growing cold beside busy woman in warm kitchen, still life moment of being unseen --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "back of woman cooking dinner alone, warm stove light, no one else in frame, intimate solitude --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "10-morning": [
    { prompt: "woman hiding face behind hands, one eye visible through fingers, warm terracotta background, vulnerability, portrait --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "cracked porcelain mask on cream linen, golden light shining through cracks, kintsugi concept, still life --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "10-evening": [
    { prompt: "polished porcelain figure of perfect mother on shelf, slightly out of focus woman behind, warm light, contrast between ideal and real --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "11-morning": [
    { prompt: "old photograph held by modern hands, mother and daughter, sepia faded, warm light on the hands, nostalgia --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "11-evening": [
    { prompt: "young child's drawing of a family on the fridge, slightly out of focus, warm kitchen light, nostalgia, emotional --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "adult woman as a younger version of herself in faded picture, layered photo concept, warm sepia tones --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "12-morning": [
    { prompt: "closed fist slowly opening, nothing inside, warm golden light from the side, close up, emotional release --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman exhaling deeply, eyes closed, wind in curly hair, warm outdoor light, freedom, letting go --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "12-evening": [
    { prompt: "smooth river stone next to a clenched fist on linen, warm still life, transformation metaphor, terracotta tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "13-morning": [
    { prompt: "mother and infant in soft fusion of light, abstract warm tones, sense of being one and yet two, ethereal portrait --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "13-evening": [
    { prompt: "woman alone in empty room, standing, looking at light coming through door, warm terracotta walls, contemplative --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "single chair in soft sunlight, woman's robe draped on it, no one in frame, presence felt, cream tones --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "14-morning": [
    { prompt: "seven smooth stones arranged on cream fabric, each a different earth tone, overhead shot, warm natural light, minimal --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman writing in journal at wooden table, close up on hands and pen, warm morning light, intimate --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "14-evening": [
    { prompt: "seven candles in line on cream linen, only one lit so far, warm intimate light, beginning of a journey, still life --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "open book of seven blank chapters on wooden surface, warm afternoon light, terracotta bookmark, minimal --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  // === SEMANA 3 ===
  "15-morning": [
    { prompt: "three generations of women, grandmother mother daughter, warm earth tones, slightly out of focus, golden hour, emotional --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "old family photograph on a wooden shelf, warm afternoon light, dust particles visible, nostalgia --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "15-evening": [
    { prompt: "two woman hands handing down a folded cream cloth across generations, warm light, transmission metaphor, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "16-morning": [
    { prompt: "DNA strand abstract softly lit on warm linen, terracotta tones, biology meets emotion, minimal still life --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "16-evening": [
    { prompt: "woman releasing folded cream cloth from open hands, warm golden hour, soft motion blur, freedom and honor --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "two paths in autumn forest, one well-worn one new, warm afternoon light, choice metaphor --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "17-morning": [
    { prompt: "hands gently placing a stone on the ground, act of releasing, warm light, earth tones, close up --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "balance scale, one side heavy with stones, other side light with a feather, warm still life, conceptual --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "17-evening": [
    { prompt: "woman standing tall in her own doorway, warm afternoon light from inside, body language of having arrived home to herself --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "18-morning": [
    { prompt: "abstract constellation pattern in warm tones over terracotta sky, soft glow points, minimal symbolic image, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "18-evening": [
    { prompt: "confident Black woman with curly hair and glasses, terracotta blazer, looking directly at camera, warm background, professional portrait --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman writing at desk with warm lamp, hands and book of notes only, intimate documentary style --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "19-morning": [
    { prompt: "mirror reflecting a real woman, messy hair, tired eyes, but beautiful in her truth, warm bathroom light, intimate --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "list written on paper, items crossed out and rewritten, warm desk light, close up, transformation visible --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "19-evening": [
    { prompt: "woman receiving warm robe from another pair of hands, gentle ceremony of being cared for, terracotta tones, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "20-morning": [
    { prompt: "two pairs of hands, one open giving back a folded fabric to another, warm soft light, ceremony of return, close up --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "20-evening": [
    { prompt: "alarm clock showing 3am, soft blue moonlight, blurred woman in bed in background, insomnia, intimate night scene --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "single warm bedside lamp casting golden circle on dark room, sense of company in solitude, still life --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "21-morning": [
    { prompt: "before and after concept, left side heavy dark, right side light and warm, split composition, transformation --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman reading her own handwritten journal, smile of recognition, warm lamp light, intimate moment --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "21-evening": [
    { prompt: "smartphone face down on cream linen with candle and notebook nearby, warm light, intentional setup, still life --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman walking toward warm doorway in soft focus, light pouring out, transformation imagery, terracotta tones --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  // === SEMANA 4 ===
  "22-morning": [
    { prompt: "overhead shot of cream linen tablecloth covered in handwritten lists, post-its, calendars, warm natural light, sheer volume visible --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman's hands holding overflowing notebook of family logistics, terracotta tones, intimate documentary --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "22-evening": [
    { prompt: "single empty chair at full dinner table, warm light, no one resting yet, conceptual still life, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "23-morning": [
    { prompt: "soft brain scan style abstract over warm pillow, terracotta tones, science meets intimacy, night light --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "23-evening": [
    { prompt: "open journal on nightstand at dawn, soft warm light, pen across page, intimate still life --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman finally sleeping with peaceful face, warm morning light through curtains, body softened, close up --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "24-morning": [
    { prompt: "mother and daughter facing each other, not touching, emotional distance visible, warm but melancholic light --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "two paths diverging in warm autumn forest, golden leaves, choice, journey metaphor --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "24-evening": [
    { prompt: "woman gently closing an old family photo album with both hands, warm afternoon light, gesture of soft release --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "25-morning": [
    { prompt: "bath of bubbles and candles in foreground, blurred exhausted woman beyond, warm bathroom light, irony of self-care --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "25-evening": [
    { prompt: "two woman hands meeting in middle of frame, equal exchange, warm cream backdrop, close up, terracotta tones --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman seated with single warm pot of tea poured for two, second cup waiting for her, still life --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "26-morning": [
    { prompt: "smartphone showing FreeMe app on warm wooden desk, journal and pen beside it, candle, lifestyle product shot --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman doing the diagnostic on phone, concentrated, warm evening light, living room, lifestyle --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "26-evening": [
    { prompt: "woman in real moment, hair undone, no makeup, terracotta sweater, looking directly to camera with quiet steadiness --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "27-morning": [
    { prompt: "imperfect handmade ceramic mug with visible thumbprint, warm cream linen, close up, beauty of imperfection, terracotta tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "27-evening": [
    { prompt: "warm spotlight on a single open page of a book, message implied, intimate still life, golden tones --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman whispering close to camera, warm side light, intimate confidence, close up portrait --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "28-morning": [
    { prompt: "scientific illustration of maternal brain in warm minimalist style on cream paper, terracotta accents, editorial --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "open scientific journal next to candle and ceramic mug, warm desk light, study and feeling combined --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "28-evening": [
    { prompt: "warm close up of woman's eyes looking directly forward with calm certainty, terracotta tones, no makeup, real --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],

  "29-morning": [
    { prompt: "cracked perfect porcelain figure with golden light shining through cracks, kintsugi concept, warm terracotta tones --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
  "29-evening": [
    { prompt: "spiral path drawn on warm cream paper, terracotta hand drawing in close up, intimate process still life --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "warm phone screen showing diagnostic flow, hand holding device, golden bedside light, intimate evening --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],

  "30-morning": [
    { prompt: "seven smooth stones arranged in a spiral on cream linen, each different terracotta tone, overhead shot, warm light, completion --ar 4:5 --s 750 --style raw", slideIndex: 0, usage: "background" },
    { prompt: "woman seen from behind walking toward warm sunrise, terracotta horizon, full sense of arrival, golden hour --ar 4:5 --s 750 --style raw", slideIndex: 1, usage: "split-top" },
  ],
  "30-evening": [
    { prompt: "sunrise over calm landscape, warm terracotta and gold, new beginning, hope, minimal, vertical composition --ar 9:16 --s 750 --style raw", slideIndex: 0, usage: "background" },
  ],
};

export function getMJPrompts(day: number, slot: "morning" | "evening"): MJPrompt[] {
  return MJ_PROMPTS[`${day}-${slot}`] || [];
}
