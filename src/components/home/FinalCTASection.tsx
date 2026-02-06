import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const benefits = [
  "No installation",
  "No commitments", 
  "Transparent by design"
];

export function FinalCTASection() {
  return (
    <section className="py-20 px-4 bg-primary">
      <div className="container mx-auto max-w-3xl text-center">
        <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-8">
          "The Future of Energy Participation Starts Here"
        </blockquote>
        
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-foreground/90">
              <Check className="h-5 w-5" />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>
        
        <Link to="/auth">
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
}
