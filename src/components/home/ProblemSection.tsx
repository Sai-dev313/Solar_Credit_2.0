import { Card, CardContent } from '@/components/ui/card';
import { GreenText } from './GreenText';
import { Sun, Users, Leaf } from 'lucide-react';

const problems = [
  {
    icon: Sun,
    title: "Rooftop solar owners export surplus to the grid — but have no visibility or incentive.",
    illustration: "🏠☀️"
  },
  {
    icon: Users,
    title: "Consumers want to support clean energy, but don't have easy ways to participate.",
    illustration: "👥💡"
  },
  {
    icon: Leaf,
    title: "Environmental impact from solar feels invisible — and emotionally unrewarding.",
    illustration: "🌿📊"
  }
];

export function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Most <GreenText>Solar Energy</GreenText> Goes Unrewarded
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-card border">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{problem.illustration}</div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {problem.title}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-center text-primary font-medium">
          SolarCredit fixes this gap — simply and responsibly.
        </p>
      </div>
    </section>
  );
}
