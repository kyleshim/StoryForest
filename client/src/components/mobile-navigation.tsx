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
      label: 'Explore',
      href: '/explore',
      active: location.includes('/explore'),
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      active: location.includes('/profile'),
    },
  ];

  return (
    <nav className="md:hidden bg-white border-t border-neutral-200 py-2 px-6 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <a className="flex flex-col items-center">
              <item.icon 
                className={cn(
                  "text-lg", 
                  item.active ? "text-primary" : "text-neutral-700"
                )} 
                size={20} 
              />
              <span className={cn(
                "text-xs mt-1", 
                item.active ? "text-primary font-medium" : "text-neutral-700"
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
