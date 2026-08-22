import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Music, Link as LinkIcon, Plus, X } from 'lucide-react';
import { AudioFormData } from './AudioFormTypes';

interface TabProps {
  formData: AudioFormData;
  setFormData: React.Dispatch<React.SetStateAction<AudioFormData>>;
}

export function BasicTab({ formData, setFormData }: TabProps) {
  const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title, slug: prev.slug ? prev.slug : generateSlug(title) }));
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.tagInput) {
      e.preventDefault();
      if (!formData.tags.includes(formData.tagInput)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, prev.tagInput!], tagInput: '' }));
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={formData.title} onChange={handleTitleChange} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Short Description</Label>
          <Textarea 
            value={formData.shortDescription} 
            onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
            className="h-20"
          />
        </div>
        <div className="space-y-2">
          <Label>Full Description</Label>
          <Textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            className="h-40"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
              <option value="english">English</option>
              <option value="bengali">Bengali</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span key={tag} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </span>
            ))}
          </div>
          <Input 
            value={formData.tagInput} 
            onChange={e => setFormData({...formData, tagInput: e.target.value})} 
            onKeyDown={handleTagsChange}
            placeholder="Type a tag and press Enter" 
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Media & Audio Source</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'upload' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'upload'})}>
            <div className="flex items-center gap-3 font-semibold text-slate-800">
              <Upload className={`w-6 h-6 ${formData.provider === 'upload' ? 'text-emerald-500' : 'text-slate-400'}`} /> Direct Audio
            </div>
          </div>
          <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'soundcloud' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'soundcloud'})}>
            <div className="flex items-center gap-3 font-semibold text-slate-800">
              <Music className={`w-6 h-6 ${formData.provider === 'soundcloud' ? 'text-orange-500' : 'text-slate-400'}`} /> SoundCloud
            </div>
          </div>
          <div className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.provider === 'other' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({...formData, provider: 'other'})}>
            <div className="flex items-center gap-3 font-semibold text-slate-800">
              <LinkIcon className={`w-6 h-6 ${formData.provider === 'other' ? 'text-blue-500' : 'text-slate-400'}`} /> External URL
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <Label>Audio URL (mp3 file link or stream link)</Label>
            <Input value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (Text format, e.g. 18:24)</Label>
              <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Duration in Seconds</Label>
              <Input type="number" value={formData.durationSeconds} onChange={e => setFormData({...formData, durationSeconds: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail (Square, e.g. 500x500)</Label>
            <Input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://..." />
            {formData.thumbnail && (
              <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 w-32 h-32 bg-slate-100 flex items-center justify-center">
                <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Feature Image (Banner / Hero, e.g. 1200x630)</Label>
            <Input value={formData.featureImage} onChange={e => setFormData({...formData, featureImage: e.target.value})} placeholder="https://..." />
            {formData.featureImage && (
              <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 w-full h-40 bg-slate-100 flex items-center justify-center">
                <img src={formData.featureImage} alt="Feature preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CurriculumTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Curriculum Mapping</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Audio Type / Category</Label>
          <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.audioType} onChange={e => setFormData({...formData, audioType: e.target.value})}>
            <option value="lesson">Lesson Audio</option>
            <option value="podcast">Podcast Episode</option>
            <option value="listening_test">Listening Test Track</option>
            <option value="pronunciation">Pronunciation Guide</option>
            <option value="music">Music / Ambience</option>
            <option value="story">Story Narration</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Board ID</Label>
            <Input value={formData.boardId} onChange={e => setFormData({...formData, boardId: e.target.value})} placeholder="e.g. wbbse" />
          </div>
          <div className="space-y-2">
            <Label>Class ID</Label>
            <Input value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} placeholder="e.g. class-10" />
          </div>
          <div className="space-y-2">
            <Label>Subject ID</Label>
            <Input value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} placeholder="e.g. biology" />
          </div>
          <div className="space-y-2">
            <Label>Chapter ID</Label>
            <Input value={formData.chapterId} onChange={e => setFormData({...formData, chapterId: e.target.value})} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Topic ID</Label>
            <Input value={formData.topicId} onChange={e => setFormData({...formData, topicId: e.target.value})} placeholder="e.g. photosynthesis" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InstructorTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Instructor / Speaker Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Speaker Name</Label>
          <Input value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Speaker Avatar URL</Label>
          <Input value={formData.instructorAvatar} onChange={e => setFormData({...formData, instructorAvatar: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Speaker Bio / Designation</Label>
          <Input value={formData.instructorBio} onChange={e => setFormData({...formData, instructorBio: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Instructor Qualification</Label>
          <Input value={formData.instructorQualification} onChange={e => setFormData({...formData, instructorQualification: e.target.value})} />
        </div>
      </CardContent>
    </Card>
  );
}

export function TranscriptTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Audio Transcript</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Transcript Content (Markdown or Plain Text)</Label>
          <Textarea 
            value={formData.transcript} 
            onChange={e => setFormData({...formData, transcript: e.target.value})} 
            className="min-h-[400px] font-mono text-sm"
            placeholder="Paste the full transcript here for SEO and accessibility..."
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourcesTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloadable Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => {
            setFormData(prev => ({ ...prev, resources: [...prev.resources, { title: '', type: 'pdf', url: '' }] }));
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add Resource
          </Button>
          
          {formData.resources.map((res, i) => (
            <div key={i} className="flex gap-2 items-end border p-4 rounded-lg bg-slate-50">
              <div className="space-y-2 flex-1">
                <Label>Title</Label>
                <Input value={res.title} onChange={e => {
                  const newRes = [...formData.resources];
                  newRes[i].title = e.target.value;
                  setFormData({...formData, resources: newRes});
                }} />
              </div>
              <div className="space-y-2 w-32">
                <Label>Type</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3" value={res.type} onChange={e => {
                  const newRes = [...formData.resources];
                  newRes[i].type = e.target.value;
                  setFormData({...formData, resources: newRes});
                }}>
                  <option value="pdf">PDF</option>
                  <option value="link">Link</option>
                  <option value="doc">Doc</option>
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <Label>URL</Label>
                <Input value={res.url} onChange={e => {
                  const newRes = [...formData.resources];
                  newRes[i].url = e.target.value;
                  setFormData({...formData, resources: newRes});
                }} />
              </div>
              <Button variant="ghost" className="text-red-500 h-10" onClick={() => {
                setFormData(prev => ({ ...prev, resources: prev.resources.filter((_, idx) => idx !== i) }));
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SeoTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Search Engine Optimization</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" id="schemaEnabled" checked={formData.schemaEnabled} onChange={e => setFormData({...formData, schemaEnabled: e.target.checked})} className="rounded border-slate-300" />
          <Label htmlFor="schemaEnabled">Enable auto-generated AudioObject Schema</Label>
        </div>
        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} placeholder={`${formData.title} | DeshExam Audio`} />
        </div>
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} className="h-20" />
        </div>
        <div className="space-y-2">
          <Label>Focus Keyword</Label>
          <Input value={formData.focusKeyword} onChange={e => setFormData({...formData, focusKeyword: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Canonical URL</Label>
          <Input value={formData.canonicalUrl} onChange={e => setFormData({...formData, canonicalUrl: e.target.value})} placeholder={`https://deshexam.com/audio/${formData.slug}`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>OG Title (Social)</Label>
            <Input value={formData.ogTitle} onChange={e => setFormData({...formData, ogTitle: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>OG Image</Label>
            <Input value={formData.ogImage} onChange={e => setFormData({...formData, ogImage: e.target.value})} placeholder="Defaults to Feature Image" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsTab({ formData, setFormData }: TabProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Advanced Settings & Access</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
          <input type="checkbox" id="isPremium" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} className="w-5 h-5 rounded border-slate-300" />
          <div>
            <Label htmlFor="isPremium" className="font-bold">Premium Content</Label>
            <p className="text-sm text-slate-500">Require subscription to access full audio</p>
          </div>
        </div>
        {formData.isPremium && (
          <div className="space-y-2 pl-4 border-l-2 border-indigo-200">
            <Label>Preview Duration (seconds)</Label>
            <Input type="number" value={formData.previewDuration} onChange={e => setFormData({...formData, previewDuration: parseInt(e.target.value) || 0})} />
            <p className="text-xs text-slate-500">Amount of audio free users can listen to before paywall</p>
          </div>
        )}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
          <input type="checkbox" id="allowDownload" checked={formData.allowDownload} onChange={e => setFormData({...formData, allowDownload: e.target.checked})} className="w-5 h-5 rounded border-slate-300" />
          <div>
            <Label htmlFor="allowDownload" className="font-bold">Allow Offline Download</Label>
            <p className="text-sm text-slate-500">Users can download the audio file directly</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsTab({ formData }: TabProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Total Plays</p>
          <h3 className="text-3xl font-bold text-slate-900">{formData.views || formData.listens || 0}</h3>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Completion Rate</p>
          <h3 className="text-3xl font-bold text-slate-900">{formData.completionRate || 0}%</h3>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Likes</p>
          <h3 className="text-3xl font-bold text-slate-900">{formData.likes || 0}</h3>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Bookmarks</p>
          <h3 className="text-3xl font-bold text-slate-900">{formData.bookmarks || 0}</h3>
        </CardContent>
      </Card>
    </div>
  );
}
