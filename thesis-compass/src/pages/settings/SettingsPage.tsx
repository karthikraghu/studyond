import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useThesisStore } from '@/store/useThesisStore';
import studentsData from '@/mock-data/students.json';

// Simple mock for "fields" mapping
const FIELD_MAP: Record<string, string> = {
  'field-01': 'Software Engineering',
  'field-02': 'Data Science',
  'field-03': 'Machine Learning',
  'field-04': 'Business Administration',
  'field-08': 'Sustainability',
  'field-09': 'Mechanical Engineering',
  'field-13': 'Economics',
  'field-17': 'Climate Science',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const context = useThesisStore((s) => s.context);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [startMonth, setStartMonth] = useState('sep');
  const [startYear, setStartYear] = useState('2024');
  const [endMonth, setEndMonth] = useState('sep');
  const [endYear, setEndYear] = useState('2026');
  
  const [newFieldText, setNewFieldText] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  // Load from Mock JSON on Mount
  useEffect(() => {
    if (context?.studentId) {
      const student = studentsData.find(s => s.id === context.studentId);
      if (student) {
        setFirstName(student.firstName);
        setLastName(student.lastName);
        setEmail(student.email);
        setDegree(student.degree);
        
        // Map field IDs to field names for UI
        const readableFields = (student.fieldIds || [])
          .map(id => FIELD_MAP[id] || id)
          .slice(0, 3);
        setFields(readableFields);
        
        // Setup mock data for things not in JSON
        setUniversity(student.universityId === 'uni-01' ? 'ETH Zurich' : student.universityId === 'uni-03' ? 'University of St. Gallen' : 'FAU Erlangen-Nürnberg');
        setStudyProgram('Information Systems');
      }
    }
  }, [context?.studentId]);

  const handleSave = () => {
    if (!context?.studentId) {
      setMessage({ text: 'No student context found.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    // Simulate Network Request
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ text: 'Profile successfully updated.', type: 'success' });
      
      setTimeout(() => setMessage(null), 3000);
    }, 600);
  };

  const addField = () => {
    if (newFieldText.trim() && fields.length < 3) {
      setFields([...fields, newFieldText.trim()]);
    }
    setNewFieldText('');
    setIsAddingField(false);
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addField();
    if (e.key === 'Escape') {
      setNewFieldText('');
      setIsAddingField(false);
    }
  };

  const removeField = (fieldToRemove: string) => {
    setFields(fields.filter((f) => f !== fieldToRemove));
  };

  if (!context?.studentId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 pb-20">
        <h2 className="text-xl font-medium mb-2">Not Signed In</h2>
        <p className="text-muted-foreground text-sm">Please select a student from the Sign In page.</p>
        <Button onClick={() => window.location.href = '/'} className="mt-4">
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/20 overflow-auto">
      <div className="max-w-[1000px] w-full mx-auto p-8 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <div className="flex items-center gap-4">
            {message && (
              <span className={`text-[13px] font-medium ${message.type === 'error' ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                {message.text}
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-9 px-5 text-[13px] font-medium transition-all"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Custom styled TabsList to match Studyond line-under style */}
          <TabsList className="bg-transparent h-auto p-0 border-b border-border w-full justify-start rounded-none space-x-6 mb-8">
            <TabsTrigger
              value="account"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-2.5 pt-0 ds-body font-medium"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-2.5 pt-0 ds-body font-medium"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-0 pb-2.5 pt-0 ds-body font-medium"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Account Tab ── */}
            <TabsContent value="account" className="mt-0 outline-none">
              <div className="bg-background border border-border rounded-xl p-8 space-y-8 shadow-sm">
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground mb-1">Account</h2>
                  <p className="ds-body text-muted-foreground">
                    If you have multiple profiles, these account settings are shared across all your profiles.
                  </p>
                </div>

                {/* Avatar */}
                <div className="relative w-20 h-20">
                  <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center text-4xl text-muted-foreground/30">
                    <span className="sr-only">Avatar placeholder</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-semibold text-[13px]">First name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10 bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-semibold text-[13px]">Last name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10 bg-muted/30" />
                  </div>
                </div>

                {/* Academic Fields tag selector */}
                <div className="space-y-3">
                  <div>
                    <Label className="font-semibold text-[13px]">Fields</Label>
                    <p className="ds-small text-muted-foreground mt-0.5">
                      Choose up to 3 fields that match your academic or professional focus.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {fields.map((field) => (
                      <div key={field} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground transition-colors hover:bg-muted">
                        {field}
                        <button
                          onClick={() => removeField(field)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {fields.length < 3 && !isAddingField && (
                      <button 
                        onClick={() => setIsAddingField(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-border rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add field
                      </button>
                    )}

                    {isAddingField && (
                       <Input 
                          autoFocus
                          value={newFieldText}
                          onChange={(e) => setNewFieldText(e.target.value)}
                          onKeyDown={handleFieldKeyDown}
                          onBlur={addField}
                          placeholder="e.g. Data Science"
                          className="h-8 max-w-[150px] text-[13px]" 
                        />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Profile Tab ── */}
            <TabsContent value="profile" className="mt-0 outline-none">
              <div className="bg-background border border-border rounded-xl p-8 space-y-8 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[15px] font-semibold text-foreground mb-1">Student profile</h2>
                    <p className="ds-body text-muted-foreground">
                      Define or see what you are looking for. These appear as actions or badges on your public user profile.
                    </p>
                  </div>
                  <Button variant="outline" className="h-8 text-xs rounded-md">
                    Preview
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Email / Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-semibold text-[13px]">Student profile address</Label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <Input value={email} readOnly disabled className="h-10 bg-muted/30 md:max-w-md text-foreground" />
                      
                      <div className="flex-1 space-y-2">
                         <div className="flex items-center gap-2 text-[13px] text-foreground">
                           <span className="w-5 h-5 bg-muted flex items-center justify-center rounded">🏛</span>
                           <Input 
                            value={university} 
                            onChange={(e) => setUniversity(e.target.value)} 
                            placeholder="e.g. FAU Erlangen-Nürnberg" 
                            className="h-8 bg-muted/30 border-transparent hover:border-border focus:bg-background transition-all -ml-2" 
                           />
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Degree */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-[13px]">Degree</Label>
                    <Select value={degree} onValueChange={setDegree}>
                      <SelectTrigger className="h-10 bg-muted/30">
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bsc">Bachelor</SelectItem>
                        <SelectItem value="msc">Master</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Study Program */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-[13px]">Study program</Label>
                    <div className="relative">
                      <Input 
                        value={studyProgram} 
                        onChange={(e) => setStudyProgram(e.target.value)}
                        placeholder="e.g. Information Systems"
                        className="h-10 bg-muted/30 pr-8" 
                      />
                      {studyProgram && (
                        <button onClick={() => setStudyProgram('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-[13px]">Start date</Label>
                    <div className="flex gap-2">
                      <Select value={startMonth} onValueChange={setStartMonth}>
                        <SelectTrigger className="h-10 bg-muted/30">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sep">Sep</SelectItem>
                          <SelectItem value="oct">Oct</SelectItem>
                          <SelectItem value="nov">Nov</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={startYear} onValueChange={setStartYear}>
                        <SelectTrigger className="h-10 bg-muted/30">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-[13px]">End date (or expected)</Label>
                    <div className="flex gap-2">
                      <Select value={endMonth} onValueChange={setEndMonth}>
                        <SelectTrigger className="h-10 bg-muted/30 text-muted-foreground">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sep">Sep</SelectItem>
                          <SelectItem value="oct">Oct</SelectItem>
                          <SelectItem value="nov">Nov</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={endYear} onValueChange={setEndYear}>
                        <SelectTrigger className="h-10 bg-muted/30 text-muted-foreground">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Preferences Tab (Empty state stub) ── */}
            <TabsContent value="preferences" className="mt-0 outline-none">
              <div className="bg-background border border-border rounded-xl p-8 space-y-6 shadow-sm">
                <h2 className="text-[15px] font-semibold text-foreground mb-1">Preferences</h2>
                <p className="ds-body text-muted-foreground">Notification and language settings will go here.</p>
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}
