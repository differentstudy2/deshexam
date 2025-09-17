
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X, BookCopy, FileClock, CircleUser, Video, Repeat } from 'lucide-react';
import { pricingData, faqData } from "@/lib/mock-data";
import { cn } from '@/lib/utils';
import { DeshExamLogo } from '@/components/icons';


export default function PricingPage() {
    const [selectedPlanId, setSelectedPlanId] = useState(pricingData.plans[0].id);

    const selectedPlan = pricingData.plans.find(p => p.id === selectedPlanId);
    const price = selectedPlan ? selectedPlan.price : 0;

    const whyMustHave = [
        {
            icon: <BookCopy className="w-8 h-8 text-primary" />,
            title: "150,000+ Mock tests",
            description: "Attempt All Mock Test"
        },
        {
            icon: <FileClock className="w-8 h-8 text-primary" />,
            title: "30000+ Prev. Year Papers Tests",
            description: "Attempt All Prev. Year Papers as Online Tests to get your AIR & Detailed Analysis"
        },
        {
            icon: <CircleUser className="w-8 h-8 text-primary" />,
            title: "Access to Practice Pro Questions",
            description: "Get access to expert curated Practice Questions to improve concepts"
        },
        {
            icon: <Video className="w-8 h-8 text-primary" />,
            title: "Access to Pro Live Tests",
            description: "Unlock All Daily Live Tests to check your All India Ranking"
        },
        {
            icon: <Repeat className="w-8 h-8 text-primary" />,
            title: "Unlimited Re-Attempt for All Tests",
            description: "Re-attempt Tests multiple times and get to learn & improve from past mistakes"
        }
    ];

  return (
    <div className="bg-secondary/30">
        <div className="container py-12 md:py-16">
            <Card className="w-full max-w-5xl mx-auto shadow-lg">
                <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left side: Benefits and Comparison */}
                        <div className="flex">
                            <div className="w-1/2 pr-4 border-r">
                                <h3 className="font-bold text-lg mb-6">Plan Benefits</h3>
                                <div className="space-y-5">
                                    {pricingData.benefits.map(benefit => (
                                        <div key={benefit.id} className="text-sm h-10 flex items-center">{benefit.name}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-1/4 text-center">
                                <h4 className="font-semibold mb-2 flex items-center justify-center gap-2"><DeshExamLogo/> Pro</h4>
                                <p className="text-xs text-muted-foreground mb-4">PASS PRO</p>
                                <div className="space-y-5">
                                    {pricingData.benefits.map(benefit => (
                                        <div key={benefit.id} className="h-10 flex items-center justify-center">
                                            {benefit.pro ? <Check className="text-green-500"/> : <X className="text-destructive"/>}
                                        </div>
                                    ))}
                                    <div className="h-10 flex items-center justify-center pt-2">
                                        <div className="w-5 h-5 rounded-full border-2 border-yellow-500 bg-yellow-100"/>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/4 text-center">
                                <h4 className="font-semibold mb-2 flex items-center justify-center gap-2"><DeshExamLogo/></h4>
                                <p className="text-xs text-muted-foreground mb-4">PASS</p>
                                 <div className="space-y-5">
                                    {pricingData.benefits.map(benefit => (
                                        <div key={benefit.id} className="h-10 flex items-center justify-center">
                                            {benefit.pass ? <Check className="text-green-500"/> : <X className="text-destructive"/>}
                                        </div>
                                    ))}
                                    <div className="h-10 flex items-center justify-center pt-2">
                                         <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side: Plan selection and payment */}
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Special Offers for You!</h3>
                                <Button variant="link" className="text-primary">Apply Coupon</Button>
                            </div>
                            <h4 className="font-semibold text-md mb-4">Select your Pass Pro Plan</h4>
                            
                             <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                <div className="space-y-3">
                                {pricingData.plans.map((plan) => (
                                    <Label 
                                        key={plan.id}
                                        htmlFor={plan.id}
                                        className={cn(
                                            "flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                            selectedPlanId === plan.id ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <RadioGroupItem value={plan.id} id={plan.id} className="mr-4"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{plan.name}</p>
                                            <p className="text-sm text-muted-foreground">Valid for {plan.validity}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm line-through text-muted-foreground">₹{plan.originalPrice}</span>
                                            <span className="font-bold text-lg ml-2">₹{plan.price}</span>
                                        </div>
                                    </Label>
                                ))}
                                </div>
                            </RadioGroup>

                            <div className="flex justify-between items-center mt-6 py-4 border-t">
                                <span className="font-semibold">To Pay</span>
                                <span className="font-bold text-xl">₹{price}</span>
                            </div>

                            <Button className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-white">
                                Proceed To Payment
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full max-w-5xl mx-auto shadow-lg mt-8 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold">This subscription does not include these individual goals:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
                            <li>UPSC, UGC, CAT, CSIR, Judiciary</li>
                            <li>IT/UM & JEE, CLAT, RRB grade-B, NEET</li>
                            <li>CUET UG</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Find these in our Exclusively created Test Series with New exam specific featuers in <span className="font-bold">DeshExam Elite</span></p>
                        <Button variant="outline" className="mt-2">Explore Pass Elite</Button>
                    </div>
                </div>
            </Card>


            <div className="w-full max-w-5xl mx-auto mt-16">
                <h2 className="text-center text-3xl font-bold font-headline mb-2">Why is DeshExam Pass Pro a must-have?</h2>
                <div className="w-24 h-1 bg-primary mx-auto mb-10"></div>
                <Card>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {whyMustHave.map(item => (
                            <div key={item.title} className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>


            <div className="w-full max-w-5xl mx-auto mt-16">
                <h2 className="text-center text-3xl font-bold font-headline mb-10">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full bg-card p-4 rounded-lg shadow-sm">
                    {faqData.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    </div>
  );
}
