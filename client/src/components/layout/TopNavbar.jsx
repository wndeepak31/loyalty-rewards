import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/Button';

const TopNavbar = ({ onMenuClick }) => {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6 lg:h-[60px]">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>

            <div className="w-full flex-1">
                {/* Placeholder for search or page title */}
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
};

export default TopNavbar;
