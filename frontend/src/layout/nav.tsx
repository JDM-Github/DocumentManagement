import React, { useState, useEffect } from 'react';
import {
	ChevronDown,
	ChevronRight,
	X,
	Menu,
	User,
	Settings,
	LogOut,
	Building,
} from 'lucide-react';
import { NavItem } from '../lib/interface';
import { navItems } from '../components/navItems';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavProps {
	isCollapsed: boolean;
	setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	isMobileOpen: boolean;
	setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
	currentPage: string;
	setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
	targetMyself: boolean;
	departmentName: string;
}

function Nav({
	isCollapsed,
	setIsCollapsed,
	isMobileOpen,
	setIsMobileOpen,
	currentPage,
	setCurrentPage,
	targetMyself,
	departmentName
}: NavProps) {
	const location = useLocation();
	const navigate = useNavigate();

	const [isAccountOpen, setIsAccountOpen] = useState(false);
	const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
	const [activeHierarchy, setActiveHierarchy] = useState<Set<string>>(new Set());

	const getActiveHierarchy = (items: NavItem[], targetLabel: string): Set<string> => {
		const hierarchy = new Set<string>();

		const findItem = (navItems: NavItem[], label: string): boolean => {
			for (const item of navItems) {
				if (item.label === label) {
					hierarchy.add(item.label);
					return true;
				}
				if (item.children) {
					if (findItem(item.children, label)) {
						hierarchy.add(item.label);
						return true;
					}
				}
			}
			return false;
		};

		findItem(items, targetLabel);
		return hierarchy;
	};

	const expandParentMenus = (items: NavItem[], targetLabel: string): Record<string, boolean> => {
		const newExpandedMenus: Record<string, boolean> = {};

		const findAndExpand = (navItems: NavItem[]): boolean => {
			for (const item of navItems) {
				if (item.label === targetLabel) {
					return true;
				}

				if (item.children) {
					const foundInChildren = findAndExpand(item.children);
					if (foundInChildren) {
						newExpandedMenus[item.label] = true;
						return true;
					}
				}
			}
			return false;
		};

		findAndExpand(items);
		return newExpandedMenus;
	};

	useEffect(() => {
		setActiveHierarchy(getActiveHierarchy(navItems, currentPage));
		const newExpandedMenus = expandParentMenus(navItems, currentPage);
		setExpandedMenus(prev => ({ ...prev, ...newExpandedMenus }));
	}, [currentPage]);

	const toggleMenu = (label: string) => {
		setExpandedMenus(prev => ({
			...prev,
			[label]: !prev[label]
		}));
	};

	const handleNavClick = (label: string, hasChildren?: boolean) => {
		if (hasChildren) {
			toggleMenu(label);
			return;
		}

		if (location.pathname !== "/") {
			navigate("/");
		}
		setCurrentPage(label);
		setIsMobileOpen(false);
	};

	const getActiveGradient = (depth: number, isActive: boolean, hasChildren: boolean): string => {
		if (!isActive) return '';

		switch (depth) {
			case 0:
				return hasChildren
					? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-white shadow-lg'
					: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg';
			case 1:
				return 'bg-gradient-to-r from-blue-500/25 to-cyan-500/25 text-white shadow-md';
			case 2:
				return 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20 text-white shadow-sm';
			default:
				return 'bg-gradient-to-r from-blue-300/15 to-cyan-300/15 text-white';
		}
	};

	const getExpandedBackground = (depth: number, isExpanded: boolean): string => {
		if (!isExpanded) return '';

		switch (depth) {
			case 0:
				return 'bg-gradient-to-b from-[#0F244A]/40 to-transparent';
			case 1:
				return 'bg-gradient-to-b from-[#0A1D3A]/30 to-transparent';
			case 2:
				return 'bg-gradient-to-b from-[#05162A]/20 to-transparent';
			default:
				return 'bg-gradient-to-b from-[#020D1F]/10 to-transparent';
		}
	};

	const renderNavItem = (item: NavItem, depth = 0) => {
		if (item.hideInMyself && targetMyself) return null;
		if (item.showOnlyToSelf && !targetMyself) return null;

		const Icon = item.icon;
		const hasChildren = item.children && item.children.length > 0;
		const isExpanded = expandedMenus[item.label];
		const isActive = activeHierarchy.has(item.label);
		const paddingLeft = depth === 0 ? "pl-3" : depth === 1 ? "pl-8" : "pl-12";
		const activeGradient = getActiveGradient(depth, isActive, !hasChildren);
		const expandedBackground = getExpandedBackground(depth, isExpanded);
		
		const haveMyNavigation = ["Documents", "To Receive", "Ongoing", "To Release", "Declined", "Completed"]; 
		const myText = (targetMyself && haveMyNavigation.some((item_text) => item.label === item_text)) ? "My " : "";

		return (
			<div
				key={`${item.label}-${depth}`}
				className={`overflow-hidden ${expandedBackground ? `rounded-lg ${expandedBackground}` : ''}`}
			>
				<button
					onClick={() => handleNavClick(item.label, hasChildren)}
					className={`w-full flex items-center justify-between gap-3 ${paddingLeft} pr-3 py-2.5 rounded-lg transition-all duration-200 group ${activeGradient || 'text-slate-200 hover:bg-white/10 hover:text-white'
						}`}
					title={isCollapsed && depth === 0 ? item.label : ""}
				>
					<div className="flex items-center gap-3 min-w-0 flex-1">
						{Icon && (
							<Icon
								size={20}
								className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"
									}`}
							/>
						)}
						<span
							className={`text-sm font-medium truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
								}`}
						>
							{myText}{item.label}
						</span>
					</div>
					{hasChildren && (
						<ChevronDown
							size={16}
							className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-4"
								} ${isExpanded ? "rotate-180" : "rotate-0"}`}
						/>
					)}
				</button>

				{hasChildren && (
					<div
						className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed
							? "max-h-0 opacity-0"
							: isExpanded
								? "max-h-[1000px] opacity-100"
								: "max-h-0 opacity-0"
							}`}
					>
						<div className="mt-1 space-y-1 py-1">
							{item.children!.map(child => renderNavItem(child, depth + 1))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}
			<aside
				className={`fixed top-0 left-0 z-30 h-screen bg-gradient-to-b from-[#10213f] to-[#0d2758] text-white transition-all duration-300 ease-in-out shadow-[8px_0_20px_rgba(0,0,0,0.15)] ${isCollapsed ? "w-20" : "w-72"
					} ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
			>
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-gradient-to-l from-[#c5c5c5] to-[#f0f0f0]">
						<div className="flex items-center gap-3 overflow-hidden">
							<div className={`${isCollapsed ? "hidden" : "w-12 h-12 flex-shrink-0"}`}>
								<img
									src="/logo.png"
									alt="DMS Logo"
									className="w-full h-full object-contain"
								/>
							</div>

							<div
								className={`text-3xl font-bold text-[#0d2758] whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
									}`}
							>
								DMS CCC
							</div>
						</div>

						<button
							onClick={() => {
								setIsCollapsed(!isCollapsed);
								if (!isCollapsed) {
									setExpandedMenus({});
									setIsAccountOpen(false);
								}
							}}
							className="hidden md:flex p-2 rounded-lg hover:bg-gray-600/50 transition-all duration-200 ml-auto group text-[#0d2758]"
						>
							<ChevronRight
								size={20}
								className={`transition-all duration-300 group-hover:scale-110 ${isCollapsed ? "rotate-0" : "rotate-180"
									}`}
							/>
						</button>

						<button
							onClick={() => setIsMobileOpen(false)}
							className="md:hidden p-2 rounded-lg hover:bg-[#0d2758]/20 transition-colors text-[#0d2758]"
						>
							<X size={20} />
						</button>
					</div>

					<nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
						<div className="space-y-1">
							{navItems.map(item => renderNavItem(item))}
						</div>
					</nav>

					<div className="border-t border-white/10 p-3">
						<div className="relative">

							<button
								onClick={() => setIsAccountOpen(prev => !prev)}
								className={`w-full flex items-center gap-3 transition-all duration-200 hover:bg-white/5 rounded-lg p-2 ${isCollapsed ? "justify-center" : ""} ${isAccountOpen && !isCollapsed ? 'bg-white/5' : ''}`}
							>

								<div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-semibold shadow-lg flex-shrink-0">
									AD
								</div>

								<div
									className={`flex-1 min-w-0 text-left transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
								>
									<p className="text-sm font-medium text-white truncate">Admin User</p>

									<p className="text-xs text-slate-400 truncate">admin@example.com</p>

								</div>

								{!isCollapsed && (
									<ChevronDown
										size={16}
										className={`flex-shrink-0 transition-transform duration-200 text-slate-400 ${isAccountOpen ? 'rotate-180' : 'rotate-0'}`}
									/>
								)}
							</button>
							<div className={`text-left mt-2 transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
								<div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
									<Building size={14} className="text-slate-400 flex-shrink-0" />
									<span className="text-sm text-slate-300 truncate">{departmentName}</span>
								</div>
							</div>


							{isAccountOpen && !isCollapsed && (
								<div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0a1929] rounded-lg shadow-xl border border-white/10 overflow-hidden">
									<div className="py-1">
										<button
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition-colors"
											onClick={() => {
												setCurrentPage('Profile');
												setIsAccountOpen(false);
											}}
										>
											<User size={16} className="flex-shrink-0" />
											<span>Profile</span>
										</button>
										<button
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition-colors"
											onClick={() => {
												setCurrentPage('Settings');
												setIsAccountOpen(false);
											}}
										>
											<Settings size={16} className="flex-shrink-0" />
											<span>Settings</span>
										</button>
										<div className="border-t border-white/10 my-1"></div>
										<button
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
											onClick={() => {
												setIsAccountOpen(false);
												// Handle logout
											}}
										>
											<LogOut size={16} className="flex-shrink-0" />
											<span>Logout</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</aside>

			<button
				onClick={() => {
					setIsMobileOpen(true);
				}}
				className={`
					fixed top-2 left-4 z-40 md:hidden
					p-2.5 rounded-lg shadow-lg
					bg-gradient-to-r from-[#1B3769] to-[#142C57] text-white
					transition-all duration-200 hover:shadow-xl hover:scale-105
					${isMobileOpen ? "hidden" : "block"}
				`}
			>
				<Menu size={20} />
			</button>
		</>
	);
}

export default Nav;