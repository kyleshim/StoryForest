import { useLocation, Link } from 'wouter';
import { Home, Search, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  childId?: number;
}

export function MobileNavigation({ childId }: MobileNavigationProps) {
  const [location] = useLocation();

  // Define navigation items to match the image
  const navItems = [
    {
      icon: Home,
      label: 'For you',
      href: '/',
      active: location === '/',
    },
    {
      icon: Search,
      label: 'Explore',
      href: '/explore',
      active: location.includes('/explore'),
    },
    {
      icon: BookOpen,
      label: 'Library',
      href: childId ? `/library/${childId}` : '/library',
      active: location.includes('/library'),
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      active: location.includes('/profile'),
    },
  ];

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 py-2 px-4 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <a className="flex flex-col items-center py-2 px-3 min-w-0">
              <item.icon 
                className={cn(
                  "text-lg mb-1", 
                  item.active ? "text-blue-500" : "text-gray-500"
                )} 
                size={24} 
              />
              <span className={cn(
                "text-xs text-center", 
                item.active ? "text-blue-500 font-medium" : "text-gray-500"
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
