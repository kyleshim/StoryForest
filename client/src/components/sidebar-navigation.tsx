import { useLocation, Link } from 'wouter';
import { BookOpen, Heart, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavigationProps {
  childId?: number;
}

export function SidebarNavigation({ childId }: SidebarNavigationProps) {
  const [location] = useLocation();

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
    <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 fixed left-0 top-16 bottom-0 z-10">
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
                data-testid={`sidebar-${item.label.toLowerCase()}`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
