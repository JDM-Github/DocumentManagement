import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import {
	TrendingUp,
	TrendingDown,
	FileText,
	Clock,
	CheckCircle,
	Users,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';

const monthlyData = [
	{ month: 'Jan', documents: 245, completed: 189, pending: 56 },
	{ month: 'Feb', documents: 312, completed: 267, pending: 45 },
	{ month: 'Mar', documents: 289, completed: 234, pending: 55 },
	{ month: 'Apr', documents: 356, completed: 298, pending: 58 },
	{ month: 'May', documents: 423, completed: 367, pending: 56 },
	{ month: 'Jun', documents: 389, completed: 344, pending: 45 },
];

const documentTypes = [
	{ name: 'Leave Requests', value: 320, color: '#3B82F6' },
	{ name: 'Budget Reports', value: 245, color: '#8B5CF6' },
	{ name: 'Evaluations', value: 189, color: '#10B981' },
	{ name: 'Supply Orders', value: 156, color: '#F59E0B' },
	{ name: 'Others', value: 124, color: '#6366F1' },
];

const accomplishments = [
	{ month: 'Jan', rate: 77 },
	{ month: 'Feb', rate: 86 },
	{ month: 'Mar', rate: 81 },
	{ month: 'Apr', rate: 84 },
	{ month: 'May', rate: 87 },
	{ month: 'Jun', rate: 92 },
];

export default function Dashboard() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<number | null>(null);

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		return { firstDay, daysInMonth };
	};

	const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

	const previousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
	};

	const nextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
	};

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	const stats = [
		{
			label: 'Total Documents',
			value: '1,234',
			change: '+12%',
			trend: 'up',
			color: 'from-blue-500 to-blue-600',
			icon: FileText,
		},
		{
			label: 'Pending Requests',
			value: '45',
			change: '-8%',
			trend: 'down',
			color: 'from-orange-500 to-orange-600',
			icon: Clock,
		},
		{
			label: 'Completed',
			value: '856',
			change: '+23%',
			trend: 'up',
			color: 'from-green-500 to-green-600',
			icon: CheckCircle,
		},
		{
			label: 'Faculty Members',
			value: '432',
			change: '+5%',
			trend: 'up',
			color: 'from-purple-500 to-purple-600',
			icon: Users,
		},
	];

	return (
		<div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full scrollbar-thin">
			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="space-y-6"
			>
				<motion.div
					variants={item}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
				>
					{stats.map((stat, i) => {
						const Icon = stat.icon;
						const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
						return (
							<motion.div
								key={i}
								whileHover={{ y: -5, scale: 1.02 }}
								className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<p className="text-sm font-medium text-slate-600 mb-1">
											{stat.label}
										</p>
										<p className="text-3xl font-bold text-slate-900">{stat.value}</p>
									</div>
									<div
										className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
									>
										<Icon className="w-6 h-6 text-white" />
									</div>
								</div>
								<div className="flex items-center gap-2">
									<TrendIcon
										className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
											}`}
									/>
									<span
										className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
											}`}
									>
										{stat.change}
									</span>
									<span className="text-sm text-slate-500">vs last month</span>
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<motion.div
						variants={item}
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<h2 className="text-xl font-bold text-slate-900 mb-4">
							Document Trends
						</h2>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={monthlyData}>
								<defs>
									<linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
										<stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
										<stop offset="95%" stopColor="#10B981" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
								<XAxis dataKey="month" stroke="#64748B" />
								<YAxis stroke="#64748B" />
								<Tooltip
									contentStyle={{
										backgroundColor: '#1E293B',
										border: 'none',
										borderRadius: '8px',
										color: '#fff',
									}}
								/>
								<Legend />
								<Area
									type="monotone"
									dataKey="documents"
									stroke="#3B82F6"
									fillOpacity={1}
									fill="url(#colorDocuments)"
								/>
								<Area
									type="monotone"
									dataKey="completed"
									stroke="#10B981"
									fillOpacity={1}
									fill="url(#colorCompleted)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</motion.div>

					<motion.div
						variants={item}
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<h2 className="text-xl font-bold text-slate-900 mb-4">
							Document Distribution
						</h2>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={documentTypes}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) =>
										`${name}: ${(percent! * 100).toFixed(0)}%`
									}
									outerRadius={100}
									fill="#8884d8"
									dataKey="value"
								>
									{documentTypes.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: '#1E293B',
										border: 'none',
										borderRadius: '8px',
										color: '#fff',
									}}
									itemStyle={{ color: '#FFFFFF' }} 
								/>
							</PieChart>
						</ResponsiveContainer>
					</motion.div>
				</div>

				{/* Calendar and Accomplishments Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Calendar */}
					<motion.div
						variants={item}
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
								<CalendarDays className="w-5 h-5" />
								Calendar
							</h2>
							<div className="flex items-center gap-2">
								<button
									onClick={previousMonth}
									className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
								>
									<ChevronLeft className="w-5 h-5" />
								</button>
								<span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
									{currentDate.toLocaleDateString('en-US', {
										month: 'long',
										year: 'numeric',
									})}
								</span>
								<button
									onClick={nextMonth}
									className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
								>
									<ChevronRight className="w-5 h-5" />
								</button>
							</div>
						</div>
						<div className="grid grid-cols-7 gap-2">
							{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
								<div
									key={day}
									className="text-center text-xs font-semibold text-slate-600 py-2"
								>
									{day}
								</div>
							))}
							{Array.from({ length: firstDay }).map((_, i) => (
								<div key={`empty-${i}`} />
							))}
							{Array.from({ length: daysInMonth }).map((_, i) => {
								const day = i + 1;
								const isToday =
									day === new Date().getDate() &&
									currentDate.getMonth() === new Date().getMonth() &&
									currentDate.getFullYear() === new Date().getFullYear();
								const isSelected = selectedDate === day;
								return (
									<motion.button
										key={day}
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => setSelectedDate(day)}
										className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isToday
												? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
												: isSelected
													? 'bg-blue-100 text-blue-700'
													: 'hover:bg-slate-100 text-slate-700'
											}`}
									>
										{day}
									</motion.button>
								);
							})}
						</div>
					</motion.div>

					{/* Accomplishment Rate */}
					<motion.div
						variants={item}
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<h2 className="text-xl font-bold text-slate-900 mb-4">
							Accomplishment Rate Analytics
						</h2>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={accomplishments}>
								<CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
								<XAxis dataKey="month" stroke="#64748B" />
								<YAxis stroke="#64748B" />
								<Tooltip
									contentStyle={{
										backgroundColor: '#1E293B',
										border: 'none',
										borderRadius: '8px',
										color: '#fff',
									}}
								/>
								<Bar dataKey="rate" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
									{accomplishments.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.rate >= 85 ? '#10B981' : '#8B5CF6'}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
						<div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
							<p className="text-sm text-slate-600">Average Accomplishment Rate</p>
							<p className="text-3xl font-bold text-purple-600">84.5%</p>
						</div>
					</motion.div>
				</div>

				<motion.div
					variants={item}
					className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
				>
					<h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
					<div className="space-y-3">
						{[
							{
								id: 1,
								action: 'Document request submitted',
								user: 'John Doe',
								time: '2h ago',
								color: 'from-blue-500 to-blue-600',
							},
							{
								id: 2,
								action: 'Leave request approved',
								user: 'Jane Smith',
								time: '4h ago',
								color: 'from-green-500 to-green-600',
							},
							{
								id: 3,
								action: 'New faculty evaluation completed',
								user: 'Mike Johnson',
								time: '5h ago',
								color: 'from-purple-500 to-purple-600',
							},
							{
								id: 4,
								action: 'Budget report reviewed',
								user: 'Sarah Wilson',
								time: '1d ago',
								color: 'from-orange-500 to-orange-600',
							},
							{
								id: 5,
								action: 'Supply order processed',
								user: 'Tom Brown',
								time: '2d ago',
								color: 'from-pink-500 to-pink-600',
							},
						].map((activity) => (
							<motion.div
								key={activity.id}
								whileHover={{ x: 5 }}
								className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
							>
								<div
									className={`w-12 h-12 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}
								>
									{activity.user.charAt(0)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-slate-900">
										{activity.action}
									</p>
									<p className="text-xs text-slate-600">by {activity.user}</p>
								</div>
								<span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
									{activity.time}
								</span>
							</motion.div>
						))}
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
}