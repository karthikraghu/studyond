import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Building2, 
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  Target
} from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock data
import expertsData from '@/mock-data/experts.json';
import companiesData from '@/mock-data/companies.json';
import fieldsData from '@/mock-data/fields.json';

/**
 * Poor man's semantic search: check for keyword overlap (duplicated here for simplicity/standalone calculation)
 */
function calculateRelevance(studentText: string, expertText: string): number {
  if (!studentText || studentText.length < 10) return 0;
  if (!expertText || expertText.length < 10) return 0;
  
  const studentWords = new Set(studentText.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
  const expertWords = new Set(expertText.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3));
  
  let matches = 0;
  studentWords.forEach(word => {
    if (expertWords.has(word)) matches++;
  });

  const overlap = (matches / Math.sqrt(studentWords.size * expertWords.size || 1));
  return Math.min(100, Math.round(overlap * 100));
}

export default function ExpertsPage() {
  const { studentProfile } = useOnboardingStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Resolve experts with metadata and relevance
  const experts = useMemo(() => {
    return (expertsData as any[]).map(expert => {
      const company = (companiesData as any[]).find(c => c.id === expert.companyId);
      const fields = (fieldsData as any[]).filter(f => expert.fieldIds.includes(f.id)).map(f => f.name);
      
      // Calculate relevance score
      // We look at the student's 'about' (their thesis topic) vs the expert's 'about' (their bio)
      const relevanceScore = studentProfile?.about 
        ? calculateRelevance(studentProfile.about, expert.about || '')
        : 0;

      return {
        ...expert,
        company,
        fields,
        relevanceScore,
        isHighRelevance: relevanceScore > 20 || (studentProfile?.fieldIds.some(fid => expert.fieldIds.includes(fid)))
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [studentProfile]);

  const filteredExperts = experts.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.fields.some((f: string) => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
            <Users className="w-4 h-4" /> Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
            Industry & Research Experts
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium mt-3">
            Connect with professionals and academics who can provide interviews, data, or feedback for your thesis.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search expertise, company..." 
            className="pl-11 rounded-full border-border bg-white shadow-sm h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Relevance Badge for Student ── */}
      {studentProfile?.about && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-primary/5 rounded-3xl border border-primary/10 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary italic">Personalized Ranking Active</p>
            <p className="text-xs text-muted-foreground">
              We've analyzed your thesis topic "<span className="text-foreground font-semibold">{studentProfile.about.substring(0, 40)}...</span>" 
              to find the most relevant expert connections.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Experts Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredExperts.map((expert, i) => (
            <motion.div
              key={expert.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "group relative rounded-[2rem] border bg-card p-6 transition-all duration-300",
                expert.isHighRelevance ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border hover:border-primary/20"
              )}
            >
              {expert.isHighRelevance && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-primary text-white border-none rounded-lg px-3 py-1 font-bold text-[10px] tracking-wider uppercase shadow-xl">
                    <Sparkles className="w-3 h-3 mr-1" /> Related to your topic
                  </Badge>
                </div>
              )}

              {/* Head */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground overflow-hidden">
                    {expert.firstName[0]}{expert.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                      {expert.firstName} {expert.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {expert.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company & Offer */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-primary opacity-60" />
                  <span className="font-semibold">{expert.company?.name || 'Independent Researcher'}</span>
                </div>
                
                {expert.offerInterviews ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> Available for Interviews
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded-lg">
                    <Info className="w-3 h-3" /> Feedback Only
                  </div>
                )}
              </div>

              {/* About snippet */}
              <div className="mb-6 h-12 overflow-hidden">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {expert.about || "Expert in the field of circular economy and sustainable manufacturing with a focus on supply chain optimization."}
                </p>
              </div>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                {expert.fields.map((field: string, idx: number) => (
                  <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {field}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" size="sm" className="flex-1 rounded-xl h-10 font-bold text-xs gap-2">
                  <ExternalLink className="w-3 h-3" /> Profile
                </Button>
                <Button size="sm" className="flex-[1.5] rounded-xl h-10 font-bold text-xs gap-2 shadow-lg shadow-primary/10">
                  <MessageSquare className="w-3 h-3" /> Contact Expert
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredExperts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No experts found matching your search.</p>
        </div>
      )}
    </div>
  );
}
