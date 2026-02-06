import { Play } from 'lucide-react';

export function VideoSection() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-3xl">
        <div className="aspect-video bg-card rounded-xl border flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-primary ml-1" />
            </div>
            <p className="text-muted-foreground font-medium">Watch Video</p>
          </div>
        </div>
      </div>
    </section>
  );
}
