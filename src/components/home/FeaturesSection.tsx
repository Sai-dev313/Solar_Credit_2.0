import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GreenText } from './GreenText';

type StatusIndicator = 'green' | 'yellow' | 'red';

interface Feature {
  title: string;
  description: string;
  status: StatusIndicator;
  statusLabel: string;
}

const features: Feature[] = [
  {
    title: "Smart Energy Dashboard",
    description: "Track your solar production, consumption, and credits in one beautiful interface.",
    status: "green",
    statusLabel: "Live"
  },
  {
    title: "Verified Solar Credits",
    description: "Every credit is tied to real energy logged — ensuring transparency and trust.",
    status: "green",
    statusLabel: "Live"
  },
  {
    title: "Bill Payment Integration",
    description: "Apply credits directly to offset your electricity bill payments.",
    status: "yellow",
    statusLabel: "Simulated"
  },
  {
    title: "AI-Powered Impact Insights",
    description: "Get personalized insights on your environmental contribution powered by AI.",
    status: "green",
    statusLabel: "Live"
  },
  {
    title: "Policy-Aware Design",
    description: "Built with Indian energy policies in mind — compliant and future-ready.",
    status: "red",
    statusLabel: "Coming"
  }
];

const statusColors: Record<StatusIndicator, string> = {
  green: "bg-primary",
  yellow: "bg-yellow-500",
  red: "bg-red-500"
};

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Key <GreenText>Features</GreenText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by AI. Designed for simplicity. Built for India.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[feature.status]}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {feature.statusLabel}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/auth">
            <Button size="lg">Explore the Platform</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
