import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface CategoryCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
}

export function CategoryCard({ icon, title, onClick }: CategoryCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <span className="font-medium">{title}</span>
        </div>
      </CardContent>
    </Card>
  );
}