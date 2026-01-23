import { Bell, Mic, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const { user, loading } = useCurrentUser();
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Guest';
  const displayRole = user && user.roles && user.roles.length > 0
    ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0]?.name)
    : '';

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search invoices, clients..." 
            className="w-64 pl-10 h-10"
          />
        </div>

        {/* Voice Button */}
        <Button variant="accent" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center">
            <User className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-foreground">
              {loading ? 'Loading...' : displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : displayRole}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
