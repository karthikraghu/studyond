import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  MapPin, 
  Users, 
  Target, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Briefcase,
  ChevronRight,
  Info
} from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import companiesData from '@/mock-data/companies.json';
import fieldsData from '@/mock-data/fields.json';

// Helper to determine match reason
function getMatchReason(company: any, studentFields: string[], studentAbout: string) {
  const companyFields = company.fieldIds || [];
  const fieldOverlap = studentFields.filter(f => companyFields.includes(f));
  
  if (fieldOverlap.length > 0) {
    const fieldNames = fieldOverlap.map(fId => {
       const field = (fieldsData as any[]).find(f => f.id === fId);
       return field?.name || 'your field';
    });
    return `Strong alignment in ${fieldNames.slice(0, 2).join(' & ')}`;
  }
  
  if (studentAbout && studentAbout.length > 10) {
     const studentWords = new Set(studentAbout.toLowerCase().split(/[^a-z0-9]+/));
     const companyWords = new Set((company.description || "").toLowerCase().split(/[^a-z0-9]+/));
     let overlap = 0;
     studentWords.forEach(w => { if (companyWords.has(w) && w.length > 4) overlap++; });
     if (overlap > 2) return "Company research aligns with your thesis topics";
  }

  return null;
}

export default function OrganizationsPage() {
  const { studentProfile } = useOnboardingStore();
  const [searchTerm, setSearchTerm] = useState('');

  const studentFieldIds = studentProfile?.fieldIds || [];
  const studentAbout = studentProfile?.about || '';

  const enrichedCompanies = useMemo(() => {
    return (companiesData as any[]).map(company => {
      const matchReason = getMatchReason(company, studentFieldIds, studentAbout);
      
      let score = 40;
      if (matchReason?.includes('alignment')) score += 40;
      else if (matchReason?.includes('research')) score += 30;
      
      return {
        ...company,
        matchReason,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }, [studentFieldIds, studentAbout]);

  const filteredCompanies = enrichedCompanies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.domains && c.domains.some((d: string) => d.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topMatches = filteredCompanies.filter(c => c.score >= 70);
  const otherCompanies = filteredCompanies.filter(c => c.score < 70);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 w-full">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-3 max-w-2xl relative">
          <div className="absolute -left-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest relative mb-3">
            <Building2 className="w-4 h-4" /> Company Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none relative">
            Find Your Industry Match
          </h1>
          <p className="text-muted-foreground text-lg relative font-medium mt-3 max-w-2xl">
            Transform your thesis from an academic exercise into a high-impact, career-launching project. Explore our premier corporate partners.
          </p>
        </div>

        <div className="relative w-full lg:w-96 shrink-0 group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search companies, domains..." 
            className="pl-14 rounded-full border-2 border-border/50 bg-white/80 backdrop-blur-md shadow-xl shadow-primary/5 h-14 text-base font-medium relative z-10 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Top Matches Section (Hero Cards) ── */}
      {topMatches.length > 0 && (
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-amber-100 rounded-2xl shadow-sm border border-amber-200">
               <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Highly Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <AnimatePresence>
              {topMatches.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                  className="group relative rounded-[3rem] bg-card border-none p-1.5 shadow-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative bg-white/95 backdrop-blur-3xl rounded-[2.75rem] h-full p-8 md:p-12 flex flex-col justify-between transition-transform duration-500 border border-white">
                     <div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                           <div className="flex items-center gap-6">
                             <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl shadow-primary/5 border border-primary/10 flex items-center justify-center p-4">
                               {company.logoUrl ? (
                                 <img src={company.logoUrl} alt={company.name} className="object-contain w-full h-full" />
                               ) : (
                                 <span className="text-4xl font-black text-primary tracking-tighter">{company.name.substring(0, 2).toUpperCase()}</span>
                               )}
                             </div>
                             <div>
                               <h3 className="text-4xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">
                                 {company.name}
                               </h3>
                               <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground mt-3 uppercase tracking-wider">
                                 <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{company.location || 'Switzerland'}</span>
                                 <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{company.size}</span>
                               </div>
                             </div>
                           </div>
                        </div>

                        <div className="mb-10">
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200/50 text-amber-800 text-sm font-black mb-8 shadow-sm"
                           >
                             <Target className="w-5 h-5" /> {company.matchReason}
                           </motion.div>
                           <p className="text-xl text-foreground/80 leading-relaxed font-semibold">
                             {company.description}
                           </p>
                        </div>

                        {company.about && (
                           <div className="bg-primary/5 rounded-[2rem] p-8 mb-10 border border-primary/10 relative overflow-hidden group-hover:bg-primary/10 transition-colors duration-500">
                              <div className="absolute right-0 top-0 opacity-5 -translate-y-4 translate-x-4">
                                 <Building2 className="w-48 h-48" />
                              </div>
                              <div className="relative">
                                 <div className="flex items-center gap-2 text-xs font-black uppercase text-primary tracking-widest mb-4">
                                    <Info className="w-4 h-4" /> Why Thesis Here?
                                 </div>
                                 <p className="text-[17px] leading-loose text-foreground/90 font-medium">
                                    "{company.about}"
                                 </p>
                              </div>
                           </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mb-10">
                          {company.domains?.map((domain: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="rounded-xl px-4 py-2 bg-background border-border shadow-sm text-sm font-bold text-foreground">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                     </div>

                     <div className="flex items-center gap-5 pt-8 mt-auto border-t border-border/60">
                        <Button className="flex-1 rounded-[1.25rem] h-16 font-black gap-3 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/25 text-lg hover:scale-[1.02] transition-transform">
                           <MessageSquare className="w-6 h-6" /> Express Interest
                        </Button>
                        <Button variant="outline" className="rounded-[1.25rem] h-16 w-16 p-0 shrink-0 hover:bg-primary/5 hover:text-primary transition-colors">
                           <ExternalLink className="w-6 h-6" />
                        </Button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── All Other Companies ── */}
      <div>
         <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black tracking-tight">Explore the Network</h2>
            <Badge variant="secondary" className="rounded-2xl bg-muted text-muted-foreground text-sm font-black px-4 py-1">{otherCompanies.length}</Badge>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {otherCompanies.map((company, i) => (
               <motion.div
                  key={company.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-card rounded-[2.5rem] border-2 border-border/50 shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-500 p-8 flex flex-col"
               >
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-muted/50 flex flex-shrink-0 items-center justify-center font-black text-2xl text-primary tracking-tighter overflow-hidden border border-border group-hover:bg-primary/5 transition-colors duration-300">
                       {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="object-contain w-full h-full p-2" />
                        ) : (
                          company.name.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div>
                       <h3 className="font-black text-2xl group-hover:text-primary transition-colors duration-300 tracking-tight">{company.name}</h3>
                       <p className="text-xs font-bold text-muted-foreground mt-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                          <Users className="w-3.5 h-3.5" /> {company.size}
                       </p>
                    </div>
                  </div>

                  <p className="text-base font-medium text-muted-foreground line-clamp-4 leading-relaxed mb-8 group-hover:line-clamp-none transition-all duration-300">
                    {company.about || company.description}
                  </p>

                  <div className="flex flex-wrap gap-2.5 mb-8 mt-auto">
                    {company.domains?.slice(0, 2).map((domain: string, idx: number) => (
                      <span key={idx} className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-primary/5 text-primary border border-primary/10 tracking-widest uppercase">
                        {domain}
                      </span>
                    ))}
                    {company.domains && company.domains.length > 2 && (
                       <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-muted text-muted-foreground tracking-widest uppercase border border-border">
                          +{company.domains.length - 2}
                       </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t-2 border-border/50">
                     <span className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
                        <Briefcase className="w-4 h-4" /> Active Topics
                     </span>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 px-5 rounded-xl font-black gap-2 group-hover:bg-primary group-hover:text-white transition-all duration-300"
                     >
                        View <ChevronRight className="w-4 h-4" />
                     </Button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
