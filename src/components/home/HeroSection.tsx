import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GreenText } from './GreenText';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center max-w-3xl">
        <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
          Built for India • Policy-aware • Transparent credits
        </Badge>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          Turn Your <GreenText>Solar Power</GreenText> into <GreenText>Real Value</GreenText>.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track energy, earn solar credits, and use them to reduce electricity bills or trade responsibly.
        </p>
        
        <Link to="#how-it-works">
          <Button variant="outline" size="lg" className="gap-2">
            See How It Works?
          </Button>
        </Link>
      </div>
    </section>
  );
}
