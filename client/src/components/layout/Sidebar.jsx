import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    CreditCard,
    Gift,
    History,
    ShieldCheck,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

import BrandLogo from '../ui/BrandLogo';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', path: '/transactions', icon: CreditCard },
        { name: 'Rewards', path: '/rewards', icon: Gift },
        { name: 'My Redemptions', path: '/redemptions', icon: History },
    ];

    const adminItems = [
        { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
        { name: 'Manage Rewards', path: '/admin/rewards', icon: Gift },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Loyalty Settings', path: '/admin/settings', icon: Settings },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                    isActive
                        ? "bg-brand-50 text-brand-600 shadow-sm border border-brand-100/60"
                        : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                )
            }
        >
            <item.icon className="h-4 w-4" />
            {item.name}
        </NavLink>
    );

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-100 bg-white">
            <div className="flex h-16 items-center border-b border-slate-100 px-5">
                <Link to="/dashboard" className="flex items-center">
                    <BrandLogo
                        imageClassName="h-7 w-auto object-contain"
                        showBadge={true}
                        badgeText="Rewards"
                    />
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <div className="py-2">
                        <h4 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                            Menu
                        </h4>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <NavItem key={item.path} item={item} />
                            ))}
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <div className="mt-6 py-2">
                            <h4 className="mb-2 px-4 text-xs font-bold tracking-wider uppercase text-brand-600">
                                Admin Panel
                            </h4>
                            <div className="space-y-1">
                                {adminItems.map((item) => (
                                    <NavItem key={item.path} item={item} />
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            <div className="mt-auto border-t border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center gap-3 px-2 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate w-40">{user?.email}</span>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-2 mt-2 text-muted-foreground hover:text-destructive" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </div>
    );
};


export default Sidebar;
