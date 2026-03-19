export interface PreferenceOption {
  id: string;
  label: string;
  description: string;
}

export const MAX_PREFERENCES = 5;

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  {
    id: 'research_field',
    label: 'Research Field Alignment',
    description: 'Prioritize topics closely aligned with your academic field.',
  },
  {
    id: 'compensation',
    label: 'Compensation',
    description: 'Prefer paid opportunities and clear compensation models.',
  },
  {
    id: 'career_growth',
    label: 'Career Growth',
    description: 'Prioritize topics with stronger role conversion potential.',
  },
  {
    id: 'workplace_flexibility',
    label: 'Workplace Flexibility',
    description: 'Favor hybrid or remote-friendly opportunities.',
  },
  {
    id: 'company_reputation',
    label: 'Company Reputation',
    description: 'Prefer opportunities at established, high-impact organizations.',
  },
  {
    id: 'sustainability_impact',
    label: 'Sustainability Impact',
    description: 'Promote topics related to sustainability and climate outcomes.',
  },
  {
    id: 'ai_innovation',
    label: 'AI/Innovation Focus',
    description: 'Favor projects with AI, data, and advanced innovation components.',
  },
  {
    id: 'industry_exposure',
    label: 'Industry Exposure',
    description: 'Prioritize company-linked topics with strong real-world context.',
  },
];

const LEGACY_PRIORITY_MAP: Record<string, string> = {
  '1': 'workplace_flexibility',
  '2': 'compensation',
  '3': 'company_reputation',
  '4': 'research_field',
};

export function normalizePriorityId(rawId: string): string {
  const trimmed = rawId.trim();
  return LEGACY_PRIORITY_MAP[trimmed] || trimmed;
}

export function buildCustomPreferenceId(label: string): string {
  return `custom:${encodeURIComponent(label.trim().toLowerCase())}`;
}

export function parseCustomPreferenceLabel(priorityId: string): string | null {
  if (!priorityId.startsWith('custom:')) {
    return null;
  }
  const encoded = priorityId.slice('custom:'.length);
  if (!encoded) {
    return null;
  }
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function getPreferenceLabel(priorityId: string): string {
  const normalized = normalizePriorityId(priorityId);
  const option = PREFERENCE_OPTIONS.find((item) => item.id === normalized);
  if (option) {
    return option.label;
  }

  const custom = parseCustomPreferenceLabel(normalized);
  if (custom) {
    return custom
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  return normalized;
}
