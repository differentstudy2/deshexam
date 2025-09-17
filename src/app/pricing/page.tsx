import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star } from "lucide-react";
import { pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Our Plans</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Choose the plan that's right for you. Get started for free or unlock powerful features with our paid plans.
        </p>
      </header>

      <Tabs defaultValue="monthly" className="w-full max-w-md mx-auto mb-12">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col h-full", plan.isPopular && "border-primary border-2 shadow-lg")}>
            {plan.isPopular && (
              <div className="bg-primary text-primary-foreground py-1 px-4 rounded-t-lg text-sm font-semibold flex items-center justify-center gap-2">
                <Star className="w-4 h-4" /> Most Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div>
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.billing && <span className="text-muted-foreground">{plan.billing}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>{plan.cta}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 text-center bg-secondary p-8 rounded-lg">
        <h3 className="font-headline text-2xl font-bold">Family & School Plans</h3>
        <p className="text-muted-foreground mt-2 mb-4">
            Need multiple accounts? We offer special pricing for families and educational institutions.
        </p>
        <Button>Contact Sales</Button>
      </div>
    </div>
  );
}
