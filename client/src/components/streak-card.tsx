import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakCardProps {
  days: number;
}

export function StreakCard({ days }: StreakCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="text-2xl font-bold">{days}</span>
          </div>
          <div>
            <div className="font-semibold">Streak</div>
            <div className="text-sm text-gray-600">day{days !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}