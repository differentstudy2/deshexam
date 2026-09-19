'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, UploadCloud } from 'lucide-react';
import { addContactMessage } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  category: z.string().min(1, "Please select a category."),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters.").max(1000, "Message cannot exceed 1000 characters."),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy."
  }),
  attachment: z.any().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
    const { toast } = useToast();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            category: 'Technical Issue',
            subject: '',
            message: '',
            privacyPolicy: false,
        },
    });

    const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
        try {
            await addContactMessage({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                category: data.category,
                subject: data.subject || '',
                message: data.message,
            });
            toast({
                title: 'Message Sent Successfully!',
                description: "Our support team will get back to you within 2 hours.",
            });
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error Sending Message',
                description: (error as Error).message,
            });
        }
    };

    const inputClasses = "w-full bg-white border border-[#E2E8F0] rounded-md px-10 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition-colors h-10";
    const labelClasses = "text-xs font-semibold text-[#0F172A] mb-1 block";
    const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]";

  return (
    <div className="w-full">
        <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">Send Us a Message</h2>
            <p className="text-[#64748B] text-sm">Fill out the form and our team will contact you soon.</p>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelClasses}>Full Name</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input {...field} className={inputClasses} />
                                    <User className={iconClasses} />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelClasses}>Email Address</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input {...field} className={inputClasses} />
                                    <Mail className={iconClasses} />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelClasses}>Phone Number (optional)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input {...field} className={inputClasses} />
                                    <Phone className={iconClasses} />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                            <FormLabel className={labelClasses}>Category <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full h-10 bg-white border border-[#E2E8F0] rounded-md px-3 text-sm text-[#0F172A] focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition-colors">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                                        <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                                        <SelectItem value="Subscription">Subscription</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}/>
                </div>

                <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                        <FormLabel className={labelClasses}>Subject</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <input {...field} className="w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition-colors h-10" />
                            </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                        <FormLabel className={labelClasses}>Message</FormLabel>
                        <FormControl>
                            <textarea {...field} className="w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition-colors min-h-[120px] resize-y" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="attachment" render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                        <FormLabel className={labelClasses}>Attachment upload</FormLabel>
                        <FormControl>
                            <div className="relative flex items-center w-max bg-white border border-[#E2E8F0] rounded-md px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium text-[#64748B]">
                                <UploadCloud className="h-4 w-4 mr-2" />
                                <span>{value ? (value as FileList)[0]?.name || 'File selected' : 'Upload file'}</span>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    onChange={(e) => onChange(e.target.files)}
                                    {...fieldProps}
                                />
                            </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}/>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
                    <FormField control={form.control} name="privacyPolicy" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    className="data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]" 
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs font-medium text-[#64748B] cursor-pointer">
                                    I agree to <a href="#" className="text-[#16A34A] hover:underline">privacy policy</a>
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}/>

                    <Button 
                        type="submit" 
                        disabled={form.formState.isSubmitting} 
                        className="bg-[#16A34A] hover:bg-[#15803d] text-white rounded-md px-6 h-10 font-bold text-sm shadow-sm transition-all"
                    >
                        {form.formState.isSubmitting ? (
                            <span className="flex items-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span> Sending...</span>
                        ) : (
                            "Send Message"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
