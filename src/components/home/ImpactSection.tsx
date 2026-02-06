import { Card, CardContent } from '@/components/ui/card';
import { GreenText } from './GreenText';
import { Leaf, Sparkles } from 'lucide-react';

const impactExamples = [
  {
    credits: 50,
    co2: "50 kg",
    equivalent: "≈ 2 trees planted for a year"
  },
  {
    credits: 200,
    co2: "200 kg",
    equivalent: "≈ 800 km of car emissions avoided"
  }
];

export function ImpactSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          We Create <GreenText>Impact</GreenText> from Numbers.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {impactExamples.map((example, index) => (
            <Card key={index} className="bg-card border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {example.credits} Credits
                </div>
                <div className="text-xl font-semibold text-primary mb-2">
                  = {example.co2} CO₂ avoided
                </div>
                <p className="text-sm text-muted-foreground">{example.equivalent}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="bg-muted/50 border">
          <CardContent className="p-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              AI-powered insights by Lovable AI
            </span>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
