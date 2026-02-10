import { useState } from 'react';
import { Bot, Loader2, Send, MessageCircleQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const QUESTIONS = [
  { id: 1, label: 'How did I earn these credits?' },
  { id: 2, label: "What's my lifetime impact?" },
  { id: 3, label: 'What happens if I sell vs use credits?' },
  { id: 4, label: 'How can I increase my contribution?' },
  { id: 5, label: 'Where did my solar energy go?' },
];

export function SolarGPTPanel() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedId, setLastFailedId] = useState<number | null>(null);
  const [lastFailedCustom, setLastFailedCustom] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const fetchAnswer = async (questionId: number, customText?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setAnswer(null);

    try {
      const body: Record<string, unknown> = { question_id: questionId };
      if (customText) body.custom_question = customText;

      const { data, error } = await supabase.functions.invoke('solargpt', { body });

      if (error) {
        const msg = error.message?.includes('429')
          ? 'Rate limit reached. Please wait a moment and try again.'
          : 'Could not fetch answer. Tap to retry.';
        setErrorMsg(msg);
        setLastFailedId(questionId);
        setLastFailedCustom(customText || null);
        return;
      }

      setAnswer(data?.answer || 'No answer available.');
      setLastFailedId(null);
      setLastFailedCustom(null);
    } catch {
      setErrorMsg('Could not fetch answer. Tap to retry.');
      setLastFailedId(questionId);
      setLastFailedCustom(customText || null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = async (questionId: number) => {
    if (loading) return;

    if (activeQuestion === questionId && !errorMsg) {
      setActiveQuestion(null);
      setAnswer(null);
      return;
    }

    setActiveQuestion(questionId);
    setShowCustomInput(false);
    await fetchAnswer(questionId);
  };

  const handleRetry = () => {
    if (lastFailedId !== null) {
      fetchAnswer(lastFailedId, lastFailedCustom || undefined);
    }
  };

  const handleCustomSubmit = async () => {
    const q = customQuestion.trim();
    if (!q || loading) return;

    setActiveQuestion(0);
    await fetchAnswer(0, q);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">SolarGPT Insights</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap a question to get a personalized explanation based on your real data.
        </p>

        <div className="grid gap-2">
          {QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuestionClick(q.id)}
              disabled={loading && activeQuestion !== q.id}
              className={`text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                activeQuestion === q.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/20'
              } disabled:opacity-50`}
            >
              {q.label}
            </button>
          ))}
        </div>

        {(loading || answer || errorMsg) && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            ) : errorMsg ? (
              <button
                onClick={handleRetry}
                className="text-sm text-destructive hover:underline cursor-pointer w-full text-left"
              >
                {errorMsg}
              </button>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{answer}</p>
            )}
          </div>
        )}

        <Separator className="my-2" />

        <button
          onClick={() => setShowCustomInput((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <MessageCircleQuestion className="h-4 w-4" />
          Have a different question? Ask SolarGPT
        </button>

        {showCustomInput && (
          <div className="flex gap-2">
            <Input
              placeholder="Type your question..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={handleCustomSubmit}
              disabled={loading || !customQuestion.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
