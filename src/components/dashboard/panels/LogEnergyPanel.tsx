import { useState } from 'react';
import { Sun, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnergyLog {
  generated: number;
  used: number;
  sent_to_grid: number;
}

interface LogEnergyPanelProps {
  energyToday: EnergyLog;
  onEnergyLogged: (log: EnergyLog) => void;
}

export function LogEnergyPanel({ energyToday, onEnergyLogged }: LogEnergyPanelProps) {
  const { toast } = useToast();
  const [generated, setGenerated] = useState('');
  const [used, setUsed] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulateSmartMeterFeed = () => {
    const randomGenerated = (Math.random() * 20 + 15).toFixed(1);
    const randomUsed = (Math.random() * 12 + 8).toFixed(1);
    setGenerated(randomGenerated);
    setUsed(randomUsed);
  };

  const handleLogEnergy = async () => {
    if (!generated || !used) return;
    
    setIsLoading(true);
    const gen = parseFloat(generated);
    const use = parseFloat(used);

    if (isNaN(gen) || isNaN(use)) {
      toast({
        variant: 'destructive',
        title: 'Invalid input',
        description: 'Please enter valid numbers'
      });
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('log_energy', {
      p_generated: gen,
      p_used: use
    });

    if (error || !data?.[0]?.success) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: data?.[0]?.message || error?.message || 'Failed to log energy'
      });
      setIsLoading(false);
      return;
    }

    const sentToGrid = Number(data[0].sent_to_grid);
    onEnergyLogged({ generated: gen, used: use, sent_to_grid: sentToGrid });
    setGenerated('');
    setUsed('');
    setIsLoading(false);
    toast({ title: 'Energy logged successfully!' });
  };

  const isAlreadyLogged = energyToday.generated > 0;
  const excessEnergy = parseFloat(generated) - parseFloat(used);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          Log Today's Energy
        </CardTitle>
        <CardDescription>
          {isAlreadyLogged 
            ? "You've already logged your energy for today" 
            : "Enter your solar generation and home usage"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAlreadyLogged ? (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sun className="h-4 w-4" />
              <span>Energy logged on {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{energyToday.generated}</p>
                <p className="text-xs text-muted-foreground">kWh Generated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{energyToday.used}</p>
                <p className="text-xs text-muted-foreground">kWh Used at Home</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{energyToday.sent_to_grid}</p>
                <p className="text-xs text-muted-foreground">kWh Sent to Grid</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Energy sent to grid:</span>
                <span className="font-semibold">{energyToday.sent_to_grid} units</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold text-primary">{energyToday.sent_to_grid} credits</span>
                <span className="text-xs text-muted-foreground">(1 unit = 1 credit)</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center pt-2 border-t border-border">
              ✓ Today's energy has been logged. Come back tomorrow to log again!
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={simulateSmartMeterFeed}
                type="button"
              >
                <Zap className="h-4 w-4 mr-2" />
                Simulate Smart Meter Feed
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="generated">Power Generated (kWh)</Label>
                <Input
                  id="generated"
                  type="number"
                  placeholder="e.g., 25"
                  value={generated}
                  onChange={(e) => setGenerated(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="used">Power Used at Home (kWh)</Label>
                <Input
                  id="used"
                  type="number"
                  placeholder="e.g., 15"
                  value={used}
                  onChange={(e) => setUsed(e.target.value)}
                />
              </div>
            </div>
            {generated && used && !isNaN(excessEnergy) && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Extra power to grid: <span className="font-semibold text-primary">
                    {Math.max(0, excessEnergy).toFixed(1)} kWh
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Equivalent credits: <span className="font-semibold text-primary">
                    {Math.max(0, excessEnergy).toFixed(1)} credits
                  </span>
                  <span className="text-xs">(1 unit = 1 credit)</span>
                </p>
              </div>
            )}
            <Button onClick={handleLogEnergy} disabled={isLoading || !generated || !used}>
              Log Energy
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
