import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface ComingSoonProps {
  page: string;
  hint?: string;
}

export function ComingSoon({ page, hint }: ComingSoonProps) {
  return (
    <Card className="animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <CardTitle>{page}</CardTitle>
        <Badge tone="accent">In Arbeit</Badge>
      </div>
      <CardDescription className="mt-2">
        {hint ??
          'Dieser Bereich ist Teil der Vision — die Inhalte folgen, sobald das Geruest steht und die KI-Anbindung entschieden ist.'}
      </CardDescription>
    </Card>
  );
}
