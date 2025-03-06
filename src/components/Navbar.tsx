
import { useState } from 'react';
import { Search, UserPlus, FilePlus, Download, Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface NavbarProps {
  onSearch: (query: string) => void;
  onAddCustomer: () => void;
  onManageFields: () => void;
  onExport: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function Navbar({
  onSearch,
  onAddCustomer,
  onManageFields,
  onExport,
  activeTab,
  onTabChange,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Real-time search if at least 2 characters or empty
    if (value === '' || value.length >= 2) {
      onSearch(value);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-4 pt-10">
          <Button className="justify-start" variant="ghost" onClick={onAddCustomer}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <Button className="justify-start" variant="ghost" onClick={onManageFields}>
            <FilePlus className="mr-2 h-4 w-4" />
            Manage Fields
          </Button>
          <Button className="justify-start" variant="ghost" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <div className="mt-4">
            <Tabs defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <DropdownMenuSeparator />
          <Button className="justify-start" variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <h2 className="text-xl font-semibold">Customer Manager</h2>
        </div>
        <div className="mr-4 md:hidden">
          <MobileMenu />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <form onSubmit={handleSearch} className="w-full md:w-2/3 lg:w-1/2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, phone, or email..."
                className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
          
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="ghost" size="sm" onClick={onAddCustomer}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={onManageFields}>
                <FilePlus className="mr-2 h-4 w-4" />
                Fields
              </Button>
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          )}
          
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
