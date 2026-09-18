export type IssueSeverity = 'low' | 'medium' | 'high';

export interface Criteria {
  detection: boolean;
  span: boolean;
  category: boolean;
  explanation: boolean;
  suggestion: boolean;
}

export interface Sentence {
  id: number;
  text: string;
  case_id?: string;
  isGoldenSet?: boolean;
  eval_status?: 'PASS' | 'FAIL';
  gold_label?: string;
  category?: string;
  type?: string;
  color?: string; // 'red' | 'yellow' | 'blue' | 'purple' | 'green'
  tag?: string;
  reason?: string[];
  suggest?: string;
  span?: string;
  safetyAlert?: string;
  severity?: IssueSeverity;
  gold_span?: string;
  gold_reason?: string;
  gold_suggest?: string;
  ai_label?: string;
  ai_issue?: {
    sentence_id: number;
    type: string;
    span: string;
    reason: string;
    severity?: string;
    suggestion: string;
  } | null;
  criteria?: Criteria;
  notes?: string;
}

export interface AuditItem {
  id: number;
  type: string;
  original: string;
  final: string;
  decision: 'ACCEPTED' | 'KEPT' | 'MANUAL_EDIT';
  timestamp?: string;
}

export interface PresetSummary {
  id: number;
  title: string;
  meta: string;
  description: string;
  count: number;
}
