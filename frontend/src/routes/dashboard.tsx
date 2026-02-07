import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
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
	Loader2,
} from 'lucide-react';
import { removeToast, showToast } from '../components/toast';
import RequestHandler from '../lib/utilities/RequestHandler';

export default function Dashboard() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [holidays, setHolidays] = useState<any[]>([]);
	const [monthlyData, setMonthlyData] = useState<any[]>([]);
	const [documentTypes, setDocumentTypes] = useState<any[]>([]);
	const [accomplishments, setAccomplishments] = useState<any[]>([]);
	const [averageRate, setAverageRate] = useState('0');

	const [stats, setStats] = useState([
		{
			label: 'Total Documents',
			value: '0',
			change: '+0%',
			trend: 'up' as 'up' | 'down',
			color: 'from-blue-500 to-blue-600',
			icon: FileText,
		},
		{
			label: 'Pending Requests',
			value: '0',
			change: '+0%',
			trend: 'down' as 'up' | 'down',
			color: 'from-orange-500 to-orange-600',
			icon: Clock,
		},
		{
			label: 'Completed',
			value: '0',
			change: '+0%',
			trend: 'up' as 'up' | 'down',
			color: 'from-green-500 to-green-600',
			icon: CheckCircle,
		},
		{
			label: 'Faculty Members',
			value: '0',
			change: '+0%',
			trend: 'up' as 'up' | 'down',
			color: 'from-purple-500 to-purple-600',
			icon: Users,
		},
	]);

	const fetchDashboardData = async () => {
		setLoading(true);
		const toastId = showToast('Loading dashboard...', 'loading');

		try {
			const [statsRes, monthlyRes, typesRes, rateRes, holidaysRes] = await Promise.all([
				RequestHandler.fetchData('GET', 'dashboard/stats', {}),
				RequestHandler.fetchData('GET', 'dashboard/monthly-data', {}),
				RequestHandler.fetchData('GET', 'dashboard/document-types', {}),
				RequestHandler.fetchData('GET', 'dashboard/accomplishment-rate', {}),
				RequestHandler.fetchData('GET', `dashboard/holidays/${currentDate.getFullYear()}`, {})
			]);

			if (statsRes.success && statsRes.stats) {
				setStats([
					{
						label: 'Total Documents',
						value: statsRes.stats.totalDocuments.value.toLocaleString(),
						change: statsRes.stats.totalDocuments.change,
						trend: statsRes.stats.totalDocuments.trend,
						color: 'from-blue-500 to-blue-600',
						icon: FileText,
					},
					{
						label: 'Pending Requests',
						value: statsRes.stats.pendingRequests.value.toLocaleString(),
						change: statsRes.stats.pendingRequests.change,
						trend: statsRes.stats.pendingRequests.trend,
						color: 'from-orange-500 to-orange-600',
						icon: Clock,
					},
					{
						label: 'Completed',
						value: statsRes.stats.completed.value.toLocaleString(),
						change: statsRes.stats.completed.change,
						trend: statsRes.stats.completed.trend,
						color: 'from-green-500 to-green-600',
						icon: CheckCircle,
					},
					{
						label: 'Faculty Members',
						value: statsRes.stats.facultyMembers.value.toLocaleString(),
						change: statsRes.stats.facultyMembers.change,
						trend: statsRes.stats.facultyMembers.trend,
						color: 'from-purple-500 to-purple-600',
						icon: Users,
					},
				]);
			}

			if (monthlyRes.success && monthlyRes.monthlyData) {
				setMonthlyData(monthlyRes.monthlyData);
			}

			if (typesRes.success && typesRes.documentTypes) {
				setDocumentTypes(typesRes.documentTypes);
			}

			if (rateRes.success) {
				if (rateRes.accomplishments) {
					setAccomplishments(rateRes.accomplishments);
				}
				if (rateRes.averageRate !== undefined) {
					setAverageRate(rateRes.averageRate);
				}
			}

			if (holidaysRes.success && holidaysRes.holidays) {
				setHolidays(holidaysRes.holidays);
			}

			showToast('Dashboard loaded successfully.', 'success');
		} catch (err) {
			console.error(err);
			showToast('Error loading dashboard.', 'error');
		} finally {
			removeToast(toastId);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	useEffect(() => {
		const fetchHolidays = async () => {
			try {
				const res = await RequestHandler.fetchData('GET', `dashboard/holidays/${currentDate.getFullYear()}`, {});
				if (res.success && res.holidays) {
					setHolidays(res.holidays);
				}
			} catch (err) {
				console.error(err);
			}
		};
		fetchHolidays();
	}, [currentDate]);

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		return { firstDay, daysInMonth };
	};

	const isHoliday = (day: number) => {
		const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		return holidays.some(h => h.date && h.date.startsWith(dateStr));
	};

	const getHolidayName = (day: number) => {
		const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		const holiday = holidays.find(h => h.date && h.date.startsWith(dateStr));
		return holiday?.name || '';
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

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center space-y-4"
				>
					<Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
					<p className="text-lg font-semibold text-slate-800">Loading Dashboard...</p>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
			<motion.div
				initial="hidden"
				animate="show"
				className="space-y-6 max-w-[1600px] mx-auto"
			>
				<motion.div
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
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<h2 className="text-xl font-bold text-slate-900 mb-4">
							Document Trends
						</h2>
						{monthlyData.length > 0 ? (
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
						) : (
							<div className="h-[300px] flex items-center justify-center text-slate-500">
								<div className="text-center">
									<FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
									<p>No trend data available yet</p>
								</div>
							</div>
						)}
					</motion.div>

					<motion.div
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<h2 className="text-xl font-bold text-slate-900 mb-4">
							Document Distribution
						</h2>
						{documentTypes.length > 0 ? (
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
						) : (
							<div className="h-[300px] flex items-center justify-center text-slate-500">
								<div className="text-center">
									<FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
									<p>No documents yet</p>
								</div>
							</div>
						)}
					</motion.div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<motion.div
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
								const holiday = isHoliday(day);
								const holidayName = getHolidayName(day);

								return (
									<motion.button
										key={day}
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => setSelectedDate(day)}
										title={holiday ? holidayName : ''}
										className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative ${isToday
											? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
											: holiday
												? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md'
												: isSelected
													? 'bg-blue-100 text-blue-700'
													: 'hover:bg-slate-100 text-slate-700'
											}`}
									>
										{day}
										{holiday && (
											<span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
										)}
									</motion.button>
								);
							})}
						</div>
						{selectedDate && isHoliday(selectedDate) && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm font-semibold text-red-900">
									🎉 {getHolidayName(selectedDate)}
								</p>
							</div>
						)}
					</motion.div>

					<motion.div
						className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
					>
						<h2 className="text-xl font-bold text-slate-900 mb-4">
							Accomplishment Rate Analytics
						</h2>
						{accomplishments.length > 0 ? (
							<>
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
									<p className="text-3xl font-bold text-purple-600">{averageRate}%</p>
								</div>
							</>
						) : (
							<div className="h-[300px] flex items-center justify-center text-slate-500">
								<div className="text-center">
									<CheckCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
									<p>No accomplishment data available yet</p>
								</div>
							</div>
						)}
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}