import { useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { Settings2, CheckCircle2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import {
  MAX_PREFERENCES,
  PREFERENCE_OPTIONS,
  buildCustomPreferenceId,
  getPreferenceLabel,
  normalizePriorityId,
} from '@/config/preferences';

interface RankedPreference {
  id: string;
  label: string;
  source: 'preset' | 'custom';
}

/**
 * PreferencesPage — Allow users to set and rank priorities using a drag-and-drop 
 * reorderable list. Focuses on premium UI and smooth interaction.
 */
export default function PreferencesPage() {
  const { formData, studentProfile, setPriorities } = useOnboardingStore();

  const initialPriorityIds = useMemo(() => {
    const fromProfile = studentProfile?.priorities || [];
    const fromForm = 'priorities' in formData && Array.isArray(formData.priorities)
      ? formData.priorities
      : [];

    const source = fromProfile.length > 0 ? fromProfile : fromForm;
    return source
      .map((id) => normalizePriorityId(id))
      .filter(Boolean)
      .slice(0, MAX_PREFERENCES);
  }, [formData, studentProfile]);

  const [items, setItems] = useState<RankedPreference[]>(() =>
    initialPriorityIds.map((id) => ({
      id,
      label: getPreferenceLabel(id),
      source: id.startsWith('custom:') ? 'custom' : 'preset',
    }))
  );

  const [customInput, setCustomInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const canAddMore = items.length < MAX_PREFERENCES;

  const addPresetPreference = (id: string) => {
    if (!canAddMore) {
      setError(`You can only rank ${MAX_PREFERENCES} preferences.`);
      return;
    }
    if (items.some((item) => item.id === id)) {
      return;
    }
    const option = PREFERENCE_OPTIONS.find((entry) => entry.id === id);
    if (!option) {
      return;
    }

    setItems((prev) => [...prev, { id: option.id, label: option.label, source: 'preset' }]);
    setError(null);
    setSaveMessage(null);
  };

  const addCustomPreference = () => {
    const normalizedInput = customInput.trim();
    if (!normalizedInput) {
      return;
    }
    if (!canAddMore) {
      setError(`You can only rank ${MAX_PREFERENCES} preferences.`);
      return;
    }

    const customId = buildCustomPreferenceId(normalizedInput);
    if (items.some((item) => item.id === customId)) {
      setCustomInput('');
      return;
    }

    setItems((prev) => [...prev, { id: customId, label: getPreferenceLabel(customId), source: 'custom' }]);
    setCustomInput('');
    setError(null);
    setSaveMessage(null);
  };

  const removePreference = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setError(null);
    setSaveMessage(null);
  };

  const handleSave = () => {
    if (items.length !== MAX_PREFERENCES) {
      setError(`Please select and rank exactly ${MAX_PREFERENCES} preferences before saving.`);
      return;
    }

    setIsSaving(true);
    setError(null);
    setTimeout(() => {
      setPriorities(items.map((item) => item.id));
      setIsSaving(false);
      setSaveMessage('Preferences saved. Match relevance now includes your ranked priorities.');
    }, 1000);
  };

  const role = formData.role;
  if (role && role !== 'student') {
    return (
      <div className="px-6 lg:px-10 py-16 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3">My Priorities</h1>
        <p className="text-muted-foreground">
          Priority ranking currently applies to the student matching flow.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto h-full">
      <div className="mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
          <Settings2 className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">My Priorities</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Select and rank exactly five priorities. We use this order from #1 to #5 to re-rank relevant roles.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-xl border border-border bg-card/50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your 5 Preferences</h2>
            <span className="text-xs text-muted-foreground">
              {items.length}/{MAX_PREFERENCES} selected
            </span>
          </div>

          <Reorder.Group
            axis="x"
            values={items}
            onReorder={(newOrder) => {
              setItems(newOrder);
              setSaveMessage(null);
            }}
            className="flex gap-2 min-h-9 overflow-x-auto pb-1"
          >
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground">No priorities selected yet.</p>
            ) : (
              items.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="shrink-0"
                  whileDrag={{ scale: 1.03 }}
                >
                  <Badge
                    variant="secondary"
                    className="rounded-full pl-2 pr-1 py-1 h-7 flex items-center gap-1.5 cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-[10px] font-semibold">#{index + 1}</span>
                    <span className="text-[11px] whitespace-nowrap">{item.label}</span>
                    <button
                      type="button"
                      className="text-muted-foreground/70 hover:text-destructive"
                      onClick={() => removePreference(item.id)}
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                </Reorder.Item>
              ))
            )}
          </Reorder.Group>

          <div className="flex gap-2">
            <Input
              value={customInput}
              onChange={(event) => setCustomInput(event.target.value)}
              placeholder="Add custom preference"
              maxLength={60}
              className="h-9"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addCustomPreference}
              disabled={!canAddMore || !customInput.trim()}
              className="h-9"
            >
              Add
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/50 space-y-3">
          <h2 className="text-sm font-semibold">Suggestions</h2>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_OPTIONS.map((option) => {
              const alreadyAdded = items.some((item) => item.id === option.id);
              return (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={alreadyAdded ? 'secondary' : 'outline'}
                  className="h-7 rounded-full text-[11px] px-2.5"
                  disabled={alreadyAdded || !canAddMore}
                  onClick={() => addPresetPreference(option.id)}
                >
                  <Plus className="w-3 h-3" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {saveMessage && (
          <p className="text-xs text-emerald-600">{saveMessage}</p>
        )}

        <div className="pt-2 w-full">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full h-10 rounded-lg text-sm font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3 italic flex items-center gap-1.5 opacity-70">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ranked priorities are now included in relevant role scoring.
          </p>
        </div>
      </div>
    </div>
  );
}
