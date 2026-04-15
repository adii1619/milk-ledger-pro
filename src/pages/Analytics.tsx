import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Lightbulb, Sun, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Predictions {
  supplyForecast: {
    nextWeekLiters: number;
    nextMonthLiters: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    insight: string;
  };
  demandForecast: {
    nextWeekLiters: number;
    nextMonthLiters: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    insight: string;
  };
  profitAnalysis: {
    currentMonthEstimate: number;
    nextMonthEstimate: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    insight: string;
  };
  recommendations: string[];
  seasonalInsights: string;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'increasing') return <TrendingUp className="h-5 w-5 text-green-600" />;
  if (trend === 'decreasing') return <TrendingDown className="h-5 w-5 text-red-500" />;
  return <Minus className="h-5 w-5 text-muted-foreground" />;
};

export default function Analytics() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('predict-analytics', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      if (data.message) {
        setMessage(data.message);
        setPredictions(null);
      } else {
        setPredictions(data.predictions);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to get predictions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">AI Analytics</h1>
            </div>
          </div>
          <Button onClick={fetchPredictions} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {loading ? 'Analyzing...' : 'Generate Predictions'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        {!predictions && !message && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Brain className="h-16 w-16 text-primary opacity-40" />
            <h2 className="text-xl font-semibold text-foreground">Predictive Analytics</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              AI analyzes your milk purchase and sale history to forecast supply, demand, and profit trends. Click "Generate Predictions" to get started.
            </p>
          </div>
        )}

        {message && (
          <Card>
            <CardContent className="py-8 text-center">
              <Brain className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground">{message}</p>
            </CardContent>
          </Card>
        )}

        {predictions && (
          <>
            {/* Supply Forecast */}
            <Card className="border-l-4 border-l-village">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendIcon trend={predictions.supplyForecast.trend} />
                  🏡 Supply Forecast (Village)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Next Week</p>
                    <p className="text-xl font-bold text-foreground">{predictions.supplyForecast.nextWeekLiters}L</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Next Month</p>
                    <p className="text-xl font-bold text-foreground">{predictions.supplyForecast.nextMonthLiters}L</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence: {predictions.supplyForecast.confidence}%</span>
                  <span className="capitalize text-foreground">{predictions.supplyForecast.trend}</span>
                </div>
                <p className="text-sm text-muted-foreground">{predictions.supplyForecast.insight}</p>
              </CardContent>
            </Card>

            {/* Demand Forecast */}
            <Card className="border-l-4 border-l-city">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendIcon trend={predictions.demandForecast.trend} />
                  🏙️ Demand Forecast (City)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Next Week</p>
                    <p className="text-xl font-bold text-foreground">{predictions.demandForecast.nextWeekLiters}L</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Next Month</p>
                    <p className="text-xl font-bold text-foreground">{predictions.demandForecast.nextMonthLiters}L</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence: {predictions.demandForecast.confidence}%</span>
                  <span className="capitalize text-foreground">{predictions.demandForecast.trend}</span>
                </div>
                <p className="text-sm text-muted-foreground">{predictions.demandForecast.insight}</p>
              </CardContent>
            </Card>

            {/* Profit Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendIcon trend={predictions.profitAnalysis.trend} />
                  💰 Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">This Month</p>
                    <p className="text-xl font-bold text-foreground">Rs.{predictions.profitAnalysis.currentMonthEstimate.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Next Month</p>
                    <p className="text-xl font-bold text-foreground">Rs.{predictions.profitAnalysis.nextMonthEstimate.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{predictions.profitAnalysis.insight}</p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-secondary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictions.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                      <span className="text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Seasonal Insights */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sun className="h-5 w-5 text-secondary" />
                  Seasonal Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{predictions.seasonalInsights}</p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
