import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const footerLinks = {
  features: [
    { label: "Core Features", href: "#" },
    { label: "Producer Dashboard", href: "/dashboard" },
    { label: "Consumer Dashboard", href: "/consumer" }
  ],
  learn: [
    { label: "What is SolarCredit?", href: "#" },
    { label: "How can we pay Electricity Bills?", href: "#" },
    { label: "SolarGPT", href: "#" }
  ]
};

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">SolarCredit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Turn your solar power into real value. Track energy, earn credits, and save on bills.
            </p>
          </div>
          
          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {footerLinks.features.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Learn More */}
          <div>
            <h4 className="font-semibold mb-4">Learn more</h4>
            <ul className="space-y-2">
              {footerLinks.learn.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 SolarCredit. Powered by clean energy.
          </p>
        </div>
      </div>
    </footer>
  );
}
