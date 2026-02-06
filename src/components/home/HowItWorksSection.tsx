import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GreenText } from './GreenText';

const steps = [
  {
    step: "Step 1",
    title: "Track",
    description: "Log how much solar energy your panels produce — even manually. No smart meter needed."
  },
  {
    step: "Step 2",
    title: "Convert",
    description: "Every extra unit sent to the grid earns you Solar Credits — a digital representation of clean energy contribution."
  },
  {
    step: "Step 3",
    title: "Use or Trade",
    description: "Use credits to offset your own electricity bills — or list them on the marketplace for others to buy."
  },
  {
    step: "Step 4",
    title: "Impact",
    description: "Every credit = 1 kg of CO₂ avoided. Watch your contribution grow and get recognised."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How <GreenText>SolarCredit</GreenText> Works
        </h2>
        
        <div className="space-y-4 mb-10">
          {steps.map((step, index) => (
            <Card key={index} className="border-l-4 border-l-primary bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {step.step}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground md:ml-4 md:mt-4">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/auth">
            <Button size="lg">Start Earning Credits</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
