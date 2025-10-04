
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { addContactMessage } from '@/lib/firebase/firestore';
import { useEffect } from 'react';


const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(500, "Message cannot exceed 500 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    useEffect(() => {
        document.title = "Contact Us | DeshExam";
        const descriptionMeta = document.querySelector('meta[name="description"]');
        descriptionMeta?.setAttribute('content', "Get in touch with the DeshExam team. We'd love to hear from you for any questions, feedback, or support inquiries.");
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        keywordsMeta?.setAttribute('content', 'contact deshexam, deshexam support, contact us, customer service');
    }, []);

    const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
        try {
            await addContactMessage(data);
            toast({
                title: 'Message Sent!',
                description: "Thanks for reaching out. We'll get back to you soon.",
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

  return (
    <div className="bg-secondary/30">
      <div className="container py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            Get In Touch
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question, feedback, or need assistance, feel free to reach out.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Send us a Message</CardTitle>
                        <CardDescription>Fill out the form below and we will get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                 <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl><Input placeholder="Regarding my subscription" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Message</FormLabel>
                                            <FormControl><Textarea placeholder="Type your message here..." className="min-h-[150px]" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>You can also reach us through these channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Mail className="w-6 h-6 text-primary" />
                            <div>
                                <h4 className="font-semibold">Email</h4>
                                <a href="mailto:support@deshexam.com" className="text-muted-foreground hover:text-primary">support@deshexam.com</a>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Phone className="w-6 h-6 text-primary" />
                            <div>
                                <h4 className="font-semibold">Phone</h4>
                                <p className="text-muted-foreground">+91 123 456 7890</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <MapPin className="w-6 h-6 text-primary" />
                            <div>
                                <h4 className="font-semibold">Address</h4>
                                <p className="text-muted-foreground">123 Learning Lane, Education City, India</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
