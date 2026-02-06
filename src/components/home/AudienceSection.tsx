import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Diamond, Check } from 'lucide-react';

const audiences = [
  {
    icon: Sun,
    title: "For Solar Producers",
    points: [
      "Turn excess solar power into tradable credits",
      "Get visibility on your clean energy impact",
      "Earn passive value from your installation"
    ],
    cta: "I Generate Solar",
    link: "/auth"
  },
  {
    icon: Diamond,
    title: "For Consumers",
    points: [
      "Buy credits to reduce your electricity bill",
      "Support clean energy without installing panels",
      "Track your carbon footprint offset"
    ],
    cta: "I Want Clean Energy",
    link: "/auth"
  }
];

export function AudienceSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Who Is This For?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audiences.map((audience, index) => (
            <Card key={index} className="bg-card border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <audience.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{audience.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {audience.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link to={audience.link}>
                  <Button variant="outline" className="w-full mt-4">
                    {audience.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
