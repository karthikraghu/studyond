import { useState } from 'react';
import { Reorder } from 'framer-motion';
import { Settings2, GripVertical, CheckCircle2, MapPin, DollarSign, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PreferencesPage — Allow users to set and rank priorities using a drag-and-drop 
 * reorderable list. Focuses on premium UI and smooth interaction.
 */
export default function PreferencesPage() {
  const [items, setItems] = useState([
    { id: '1', title: 'Location', desc: 'Remote-first or specific geographical areas.', icon: MapPin },
    { id: '2', title: 'Compensation', desc: 'Monthly stipend or project-based fee.', icon: DollarSign },
    { id: '3', title: 'Industry Reputation', desc: 'Working with big companies or high-growth startups.', icon: Building2 },
    { id: '4', title: 'Research Field', desc: 'Specific alignment with your degree program.', icon: Briefcase },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Preferences saved successfully!');
    }, 1000);
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto h-full flex flex-col items-center">
      <div className="w-full mb-10 text-center">
        <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 rotate-3">
          <Settings2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Priorities</h1>
        <p className="text-muted-foreground w-3/4 mx-auto text-sm">
          Drag and drop to rank your preferences. Our matching engine will prioritize roles 
          that align with your top choices.
        </p>
      </div>

      <div className="w-full space-y-6 flex-1 max-w-md">
        <Reorder.Group 
          axis="y" 
          values={items} 
          onReorder={setItems}
          className="space-y-3"
        >
          {items.map((item, index) => (
            <Reorder.Item 
              key={item.id} 
              value={item}
              className="group p-4 rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-md transition-all active:cursor-grabbing cursor-grab flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>

              {/* Priority Badge */}
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/70'}`}>
                  {index === 0 ? 'TOP PRIORITY' : `#${index + 1}`}
                </div>
                <div className="text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <div className="pt-8 w-full">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full h-12 rounded-xl text-md font-bold"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground mt-4 italic flex justify-center items-center gap-1.5 opacity-70">
            <CheckCircle2 className="w-3.5 h-3.5" /> Changes take effect immediately in matchmaking.
          </p>
        </div>
      </div>
    </div>
  );
}
