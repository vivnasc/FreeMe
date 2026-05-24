export type BlockerName =
  | "peso"
  | "vazio"
  | "culpa"
  | "medo"
  | "vergonha"
  | "magoa"
  | "rancor";

export const THERAPEUTIC_ORDER: BlockerName[] = [
  "peso",
  "vazio",
  "culpa",
  "medo",
  "vergonha",
  "magoa",
  "rancor",
];

export const BLOCKER_DEPENDENCIES: Record<BlockerName, BlockerName[]> = {
  peso: [],
  vazio: ["peso"],
  culpa: ["peso", "vazio"],
  medo: ["culpa"],
  vergonha: ["culpa"],
  magoa: ["vergonha"],
  rancor: ["magoa"],
};

export interface Profile {
  id: string;
  display_name: string | null;
  locale: "pt" | "en";
  created_at: string;
}

export interface DiagnosticResponse {
  question_id: number;
  option_id: string;
  blocker_scores: Partial<Record<BlockerName, number>>;
}

export interface Diagnostic {
  id: string;
  user_id: string;
  responses: DiagnosticResponse[];
  blocker_totals: Record<BlockerName, number>;
  active_blockers: BlockerName[];
  path_order: BlockerName[];
  trauma_flag: boolean;
  completed_at: string;
}

export interface Journey {
  id: string;
  user_id: string;
  diagnostic_id: string;
  path_order: BlockerName[];
  current_index: number;
  started_at: string;
  completed_at: string | null;
}

export interface BlockerProgress {
  id: string;
  journey_id: string;
  blocker_name: BlockerName;
  order_in_path: number;
  started_at: string;
  completed_at: string | null;
  unlocked_at: string | null;
}

export interface Annotation {
  id: string;
  user_id: string;
  blocker_name: BlockerName;
  step_index: number;
  is_integration: boolean;
  content: string;
  created_at: string;
  updated_at: string;
}
