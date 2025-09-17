
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, X, BookCopy, FileClock, CircleUser, Video, Repeat, Info } from 'lucide-react';
import { pricingData, faqData } from "@/lib/mock-data";
import { cn } from '@/lib/utils';
import { DeshExamLogo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function PricingPage() {
    const [planType, setPlanType] = useState<'pro' | 'pass'>('pro');
    const [selectedDurationId, setSelectedDurationId] = useState(pricingData.plans.pro[1].id);

    const currentPlans = pricingData.plans[planType];
    const selectedPlan = currentPlans.find(p => p.id === selectedDurationId);
    const price = selectedPlan ? selectedPlan.price : 0;
    
    useEffect(() => {
        // When planType changes, update the selectedDurationId to a valid one in the new plan type.
        // We default to the bestseller of the new plan type.
        const newPlans = pricingData.plans[planType];
        const bestseller = newPlans.find(p => p.bestseller) || newPlans[0];
        setSelectedDurationId(bestseller.id);
    }, [planType]);


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

            <Tabs defaultValue="pro" onValueChange={(value) => setPlanType(value as 'pro' | 'pass')} className="w-full max-w-sm mx-auto mb-4">
                 <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pro">
                        <span className="flex items-center gap-2">Pass Pro <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-100">Suggested</Badge></span>
                    </TabsTrigger>
                    <TabsTrigger value="pass">Pass</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card className="w-full max-w-5xl mx-auto shadow-lg">
                <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left side: Benefits and Comparison */}
                        <div className="flex border rounded-lg p-1">
                            <div className="w-1/2 py-4 pr-4">
                                <h3 className="font-bold text-lg mb-6 pl-4">Plan Benefits</h3>
                                <div className="space-y-5">
                                    {pricingData.benefits.map(benefit => (
                                        <div key={benefit.id} className="text-sm h-10 flex items-center pl-4">{benefit.name}</div>
                                    ))}
                                </div>
                            </div>
                            <div className={cn("w-1/4 text-center rounded-md p-2 transition-all", planType === 'pro' && 'bg-secondary')}>
                                <p className="text-xs text-muted-foreground mb-4 pt-8">PASS PRO</p>
                                 <div className="space-y-5">
                                    {pricingData.benefits.map(benefit => (
                                        <div key={benefit.id} className="h-10 flex items-center justify-center">
                                            {benefit.pro ? <Check className="text-green-500"/> : <X className="text-destructive"/>}
                                        </div>
                                    ))}
                                    <div className="h-10 flex items-center justify-center pt-2">
                                        <RadioGroup value={planType} onValueChange={(val) => setPlanType(val as 'pro' | 'pass')}>
                                            <RadioGroupItem value="pro" id="select-pro" />
                                        </RadioGroup>
                                    </div>
                                </div>
                            </div>
                            <div className={cn("w-1/4 text-center rounded-md p-2 transition-all", planType === 'pass' && 'bg-secondary')}>
                                <p className="text-xs text-muted-foreground mb-4 pt-8">PASS</p>
                                 <div className="space-y-5">
                                    {pricingData.benefits.map(benefit => (
                                        <div key={benefit.id} className="h-10 flex items-center justify-center">
                                            {benefit.pass ? <Check className="text-green-500"/> : <X className="text-destructive"/>}
                                        </div>
                                    ))}
                                     <div className="h-10 flex items-center justify-center pt-2">
                                        <RadioGroup value={planType} onValueChange={(val) => setPlanType(val as 'pro' | 'pass')}>
                                            <RadioGroupItem value="pass" id="select-pass" />
                                        </RadioGroup>
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
                            <h4 className="font-semibold text-md mb-4">Select your {planType === 'pro' ? 'Pass Pro' : 'Pass'} Plan</h4>
                            
                             <RadioGroup value={selectedDurationId} onValueChange={setSelectedDurationId}>
                                <div className="space-y-3">
                                {currentPlans.map((plan) => (
                                    <Label 
                                        key={plan.id}
                                        htmlFor={plan.id}
                                        className={cn(
                                            "flex items-center p-4 border rounded-lg cursor-pointer transition-all relative",
                                            selectedDurationId === plan.id ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        {plan.bestseller && (
                                            <Badge className="absolute -top-2 right-12 bg-yellow-400 text-yellow-900">Bestseller</Badge>
                                        )}
                                        {plan.discount && (
                                            <Badge className="absolute -top-2 right-2 bg-green-500 text-white">{plan.discount}% OFF</Badge>
                                        )}
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
                                <span className="font-semibold flex items-center gap-1">To Pay <Info className="w-4 h-4 text-muted-foreground"/></span>
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
