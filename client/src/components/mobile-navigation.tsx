import { useLocation, Link } from 'wouter';
import { BookOpen, Heart, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  childId?: number;
}

export function MobileNavigation({ childId }: MobileNavigationProps) {
  const [location] = useLocation();

  // Define navigation items
  const navItems = [
    {
      icon: BookOpen,
      label: 'Library',
      href: childId ? `/library/${childId}` : '/',
      active: location.includes('/library') || location === '/',
    },
    {
      icon: Heart,
      label: 'Wishlist',
      href: childId ? `/wishlist/${childId}` : '/',
      active: location.includes('/wishlist'),
    },
    {
      icon: Compass,
      label: 'Discover',
      href: childId ? `/discover/${childId}` : '/',
      active: location.includes('/discover'),
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      active: location.includes('/profile'),
    },
  ];

  return (
    <nav className="md:hidden bg-white border-t border-neutral-200 py-3 px-6 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <a 
              className="flex flex-col items-center gap-1"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon 
                className={cn(
                  item.active ? "text-emerald-600" : "text-neutral-600"
                )} 
                size={24} 
              />
              <span className={cn(
                "text-xs", 
                item.active ? "text-emerald-600 font-medium" : "text-neutral-600"
              )}>
                {item.label}
              </span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
