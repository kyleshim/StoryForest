import { Card, CardContent } from '@/components/ui/card';

interface FeaturedBookCardProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor?: string;
  onClick?: () => void;
}

export function FeaturedBookCard({ 
  title, 
  subtitle, 
  backgroundColor, 
  textColor = 'text-white',
  onClick 
}: FeaturedBookCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${backgroundColor} min-h-[120px]`}
      onClick={onClick}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div>
          <h3 className={`font-bold text-lg ${textColor} mb-1`}>
            {title}
          </h3>
          <p className={`text-sm ${textColor} opacity-90`}>
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}