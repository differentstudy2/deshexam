'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Image as ImageIcon, Link as LinkIcon, PlusCircle, CheckCircle2 } from 'lucide-react';
import { sendPushNotification } from '@/ai/flows/send-push-notification';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// New Components
import { AnalyticsBar } from './components/AnalyticsBar';
import { MobilePreview } from './components/MobilePreview';

const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  body: z.string().min(5, "Message body must be at least 5 characters."),
  link: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  imageUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function PushNotificationPage() {
    const { toast } = useToast();
    const [subscriberCount, setSubscriberCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        let unsubscribe: () => void;
        if(user) {
            const tokensCollection = collection(db, 'fcmTokens');
            unsubscribe = onSnapshot(tokensCollection, (snapshot) => {
                setSubscriberCount(snapshot.size);
            }, (error) => {
                console.error("Error fetching subscriber count in real-time: ", error);
            });
        }
        return () => {
          if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: '',
            body: '',
            link: '',
            imageUrl: '',
        },
    });

    const onSubmit: SubmitHandler<NotificationFormValues> = async (data) => {
        try {
            await sendPushNotification({
                title: data.title,
                body: data.body,
                link: data.link || undefined,
                imageUrl: data.imageUrl || undefined,
            });
            toast({
                title: 'Success!',
                description: 'Notification has been sent to all subscribers.',
            });
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Sending Notifications',
                description: (error as Error).message,
            });
        }
    };

    return (
      <div className="space-y-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 min-h-screen">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Push Notifications</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium flex items-center gap-2">
              Admin <span className="text-slate-300">/</span> Notifications <span className="text-slate-300">/</span> Push
            </p>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all active:scale-95 rounded-full px-6">
            <PlusCircle className="w-4 h-4 mr-2" /> New Campaign
          </Button>
        </div>

        {/* Analytics Section */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase">Page Overview Analytics</h2>
          <AnalyticsBar subscriberCount={subscriberCount} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Campaign Composer (Left) */}
          <div className="xl:col-span-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">Campaign Composer</h2>
              <h1 className="text-2xl font-bold text-slate-800">Create Push Notification</h1>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column of Composer */}
                  <div className="space-y-6">
                    {/* Section 1 */}
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-3 pt-4">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section 1 — Notification Type</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <Tabs defaultValue="instant" className="w-full">
                          <TabsList className="w-full grid grid-cols-3 bg-slate-100/80 p-1 rounded-lg">
                            <TabsTrigger value="instant" className="text-xs font-semibold rounded-md data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all shadow-none">Instant</TabsTrigger>
                            <TabsTrigger value="scheduled" className="text-xs font-semibold rounded-md">Scheduled</TabsTrigger>
                            <TabsTrigger value="automated" className="text-xs font-semibold rounded-md">Automated</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        
                        <div className="mt-5">
                          <p className="text-[11px] font-semibold text-slate-500 mb-2">Automated examples (Templates)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" type="button" className="justify-start text-xs h-8 border-dashed hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-white">New mock test</Button>
                            <Button variant="outline" size="sm" type="button" className="justify-start text-xs h-8 border-dashed hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-white">New blog post</Button>
                            <Button variant="outline" size="sm" type="button" className="justify-start text-xs h-8 border-dashed hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-white">Practice reminder</Button>
                            <Button variant="outline" size="sm" type="button" className="justify-start text-xs h-8 border-dashed hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-white">Daily streak</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 2 */}
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-3 pt-4">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section 2 — Audience Targeting</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-5">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-700 mb-2">Target options</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer shadow-sm shadow-emerald-500/20">All Users</Badge>
                            <Badge variant="secondary" className="hover:bg-slate-200 cursor-pointer font-medium text-slate-600">Free Users</Badge>
                            <Badge variant="secondary" className="hover:bg-slate-200 cursor-pointer font-medium text-slate-600">Premium</Badge>
                            <Badge variant="secondary" className="hover:bg-slate-200 cursor-pointer font-medium text-slate-600">Inactive</Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-slate-700 mb-2">Advanced filters</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1.5">Boards</p>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="outline" className="text-[9px] px-1.5 bg-emerald-50 text-emerald-600 border-emerald-200 cursor-pointer">WBBSE</Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 cursor-pointer text-slate-500">WBCHSE</Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 cursor-pointer text-slate-500">CBSE</Badge>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1.5">Classes</p>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="outline" className="text-[9px] px-1.5 cursor-pointer text-slate-500">Class 9</Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 cursor-pointer text-slate-500">Class 10</Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 bg-emerald-50 text-emerald-600 border-emerald-200 cursor-pointer">Class 11</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                          <p className="text-xs font-semibold text-slate-600">Live estimated audience</p>
                          <p className="text-sm font-bold text-slate-900">{subscriberCount.toLocaleString()} users</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column of Composer */}
                  <div className="space-y-6">
                    {/* Section 3 */}
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-3 pt-4">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section 3 — Notification Content</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-700 flex justify-between">
                              Title <span className="font-medium text-[10px] text-slate-400">Max 80 chars</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., Special Offer Inside! 🎉" className="bg-slate-50/50 focus-visible:ring-emerald-500" {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="body" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-700 flex justify-between">
                              Message <span className="font-medium text-[10px] text-slate-400">Max 150 chars</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea placeholder="Write a compelling message here..." className="bg-slate-50/50 resize-none focus-visible:ring-emerald-500" rows={3} {...field} />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )} />

                        <div className="space-y-4 pt-2">
                          <FormField control={form.control} name="link" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700 flex justify-between">
                                Deep Link URL <span className="font-medium text-[10px] text-emerald-500 bg-emerald-50 px-1.5 rounded-sm">Improves CTR</span>
                              </FormLabel>
                              <div className="relative">
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <FormControl>
                                  <Input placeholder="https://deshexam.com/mock-test/123" className="pl-8 bg-slate-50/50 focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                              </div>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700 flex justify-between">
                                Banner Image URL <span className="font-medium text-[10px] text-slate-400">Optional</span>
                              </FormLabel>
                              <div className="relative">
                                <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <FormControl>
                                  <Input placeholder="https://.../image.png" className="pl-8 bg-slate-50/50 focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                              </div>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-4 z-20 flex justify-end items-center gap-3 p-4 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Draft auto-saved
                  </span>
                  <Button type="button" variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold text-sm h-10 px-5">Save Draft</Button>
                  <Button type="button" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm h-10 px-5">Test Notification</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/25 h-10 px-6 rounded-lg transition-all active:scale-[0.98]">
                    <Send className="w-4 h-4 mr-2" />
                    {form.formState.isSubmitting ? 'Sending Broadcast...' : 'Send Notification'}
                  </Button>
                </div>

              </form>
            </Form>

            {/* Campaign History */}
            <div className="pt-6">
               <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">Campaign History Table</h2>
               <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left text-slate-500">
                     <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                       <tr>
                         <th className="px-6 py-4 font-semibold tracking-wider">Campaign Name</th>
                         <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                         <th className="px-6 py-4 font-semibold tracking-wider">Audience</th>
                         <th className="px-6 py-4 font-semibold tracking-wider">Sent</th>
                         <th className="px-6 py-4 font-semibold tracking-wider">Open Rate</th>
                         <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       <tr className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-900">
                           Mock Test Alert
                           <div className="text-[10px] font-normal text-slate-400 mt-0.5">Auto pull new mock title</div>
                         </td>
                         <td className="px-6 py-4 text-slate-600">Push</td>
                         <td className="px-6 py-4 text-slate-600">52,410 users</td>
                         <td className="px-6 py-4 text-slate-600">199</td>
                         <td className="px-6 py-4 text-emerald-600 font-medium">8.5%</td>
                         <td className="px-6 py-4">
                           <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Sent</Badge>
                         </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-900">
                           Daily Practice Reminder
                           <div className="text-[10px] font-normal text-slate-400 mt-0.5">Continue your practice streak</div>
                         </td>
                         <td className="px-6 py-4 text-slate-600">Push</td>
                         <td className="px-6 py-4 text-slate-600">Premium</td>
                         <td className="px-6 py-4 text-slate-600">--</td>
                         <td className="px-6 py-4 text-slate-600 font-medium">--</td>
                         <td className="px-6 py-4">
                           <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">Scheduled</Badge>
                         </td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               </Card>
            </div>
          </div>

          {/* Right Panel: Live Preview & Insights */}
          <div className="xl:col-span-4 space-y-6">
            <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">Right Panel</h2>
            
            <MobilePreview 
              title={form.watch('title')} 
              message={form.watch('body')} 
              imageUrl={form.watch('imageUrl')}
            />

            {/* AI Recommendations */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 sticky top-[650px]">
              <CardHeader className="bg-transparent pb-2 pt-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 backdrop-blur border border-indigo-100 p-3 rounded-lg">
                      <p className="text-xs font-bold text-slate-800 mb-1">Title too long</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Keep it under 40 chars for max visibility on lock screens.</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur border border-indigo-100 p-3 rounded-lg">
                      <p className="text-xs font-bold text-slate-800 mb-1">CTR can improve</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Add an urgency word like "Today" or "Now".</p>
                    </div>
                 </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    );
}
