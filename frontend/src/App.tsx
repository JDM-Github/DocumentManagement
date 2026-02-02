import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./lib/context/auth";
import Nav from "./layout/nav";
import Header from "./layout/header";
import Footer from "./layout/footer";
import Dashboard from "./routes/dashboard";
import OngoingRequest from "./routes/documenttracking/ongoing";
import ToReceieve from "./routes/documenttracking/toreceive";
import ToRelease from "./routes/documenttracking/torelease";
import RequestLogsTable from "./routes/documenttracking/requestletterlog";
import MyRequests from "./routes/documenttracking/myrequest";
import MyRequestLogsTable from "./routes/documenttracking/myrequestlogs";
import CreateRequest from "./routes/documenttracking/create";
import MyRequestOngoing from "./routes/documenttracking/myrequestongoing";
import MyRequestToReceived from "./routes/documenttracking/myrequestreceive";
import MyRequestRelease from "./routes/documenttracking/myrequestrelease";
import RequestView from "./routes/documenttracking/view";
import LoginScreen from "./routes/login";
import NotFoundPage from "./routes/not-found";
import CreatePassSlip from "./routes/passslip/create-pass-slip";
import MyPassSlips from "./routes/passslip/pass-slip-record";
import PassSlipsHR from "./routes/passslip/hr-pass-slip-record";
import ViewPassSlip from "./routes/passslip/view-pass-slip";
import CreateAccomplishmentReport from "./routes/accomplishment-report/create-accomplishment-report";
import MyAccomplishmentRecord from "./routes/accomplishment-report/accomplishment-report-record";
import ViewAccomplishmentReport from "./routes/accomplishment-report/view-accomplishment-record";
import AccomplishmentRecord from "./routes/accomplishment-report/hr-accomplishment-report-record";
import PersonalInformation from "./routes/personal-data-sheet/personal-information";
import FamilyBackground from "./routes/personal-data-sheet/family-background";
import EducationalBackground from "./routes/personal-data-sheet/educational-background";
import CivilServiceEligibility from "./routes/personal-data-sheet/civil-service-eligibility";
import WorkExperience from "./routes/personal-data-sheet/work-experience";
import VoluntaryWork from "./routes/personal-data-sheet/voluntary-work";
import LearningAndDevelopment from "./routes/personal-data-sheet/learning-and-development";
import SkillsAndHobbies from "./routes/personal-data-sheet/skills-and-hobbies";
import OtherInformation from "./routes/personal-data-sheet/other-information";
import References from "./routes/personal-data-sheet/references";
import ViewPersonalDataSheet from "./routes/personal-data-sheet/print-information";
import UserProfile from "./routes/profile";

export default function App() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [targetMyself, setTargetMyself] = useState<boolean>(() => {
		return localStorage.getItem("targetMyself") === "true";
	});
	const [currentPage, setCurrentPage] = useState(() => {
		return localStorage.getItem("currentPage") || "Dashboard";
	});

	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const allowedPaths = ["/", "/requests/", "/pass-slip/", "/accomplishment/", "/profile"];

	const isAllowedPath = allowedPaths.some(
		(path) =>
			location.pathname === path ||
			(location.pathname.startsWith(path) && path !== "/")
	);

	useEffect(() => {
		document.title = currentPage + " - Document Tracking System";
	}, [currentPage]);

	useEffect(() => {
		localStorage.setItem("currentPage", currentPage);
	}, [currentPage]);

	useEffect(() => {
		localStorage.setItem("targetMyself", targetMyself.toString());
	}, [targetMyself]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-slate-600 font-medium">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) { return <LoginScreen />; }

	const userId = user?.id || "1";
	const departmentId = user?.departmentId || null;
	const departmentName = user?.departmentName || "Not in Department";
	const isHead = user?.isHead || false;
	// const isHead = true;

	const getNotFound = () => {
		return <NotFoundPage
			onNavigateHome={() => {
				setCurrentPage("Dashboard");
				navigate("/");
			}}
			onNavigateBack={() => navigate(-1)}
			onNavigateToPage={(page) => {
				setCurrentPage(page);
				navigate("/");
			}}
		/>
	}

	const VIEW = {
		EVERYONE: "EVERYONE",
		MYSELF: "MYSELF",
		OTHERS: "OTHERS",
	};

	const getViewType = () => {
		if (targetMyself && departmentId) return VIEW.MYSELF;
		if (!targetMyself && departmentId) return VIEW.OTHERS;
		return VIEW.EVERYONE;
	};

	const getComponent = () => {
		const view = getViewType();

		switch (currentPage) {
			case "Dashboard": return <Dashboard />;
			case "Profile":
				return <div className="p-6"><h1 className="text-2xl font-bold">Profile Page</h1></div>;
			case "Settings":
				return <div className="p-6"><h1 className="text-2xl font-bold">Settings Page</h1></div>;

		}

		switch (view) {
			case VIEW.MYSELF:
				switch (currentPage) {
					case "Personal Information": return <PersonalInformation />
					case "Family Background": return <FamilyBackground />
					case "Educational Background": return <EducationalBackground />
					case "Civil Service Eligibility": return <CivilServiceEligibility />
					case "Work Experience": return <WorkExperience />
					case "Voluntary Work": return <VoluntaryWork />
					case "Learning and Development": return <LearningAndDevelopment />
					case "Skills and Hobbies": return <SkillsAndHobbies />
					case "Other Information": return <OtherInformation />
					case "Reference": return <References />
					case "Print / View": return <ViewPersonalDataSheet />


					case "Create Document": return <CreateRequest userId={userId} />;
					case "To Receive":
						return <MyRequestToReceived currentPage={currentPage} userId={userId} />;
					case "Create Pass Slip": return <CreatePassSlip />
					case "My Pass Slip": return <MyPassSlips />

					case "Create Accomplishment": return <CreateAccomplishmentReport />
					case "My Accomplishment": return <MyAccomplishmentRecord />

					case "Ongoing":
						return <MyRequestOngoing currentPage={currentPage} userId={userId} />;

					case "To Release":
						return <MyRequestRelease currentPage={currentPage} userId={userId} />;

					case "Document Logs":
						return <MyRequestLogsTable userId={userId} />;

					case "Declined":
						return (
							<MyRequests
								key="my-request-tabled-declined"
								title={currentPage}
								userId={userId}
								status="DECLINED"
							/>
						);

					case "Completed":
						return (
							<MyRequests
								key="my-request-tabled-completed"
								title={currentPage}
								userId={userId}
								status="COMPLETED"
							/>
						);

					case "Reviewed":
						return getNotFound();

					default:
						return getNotFound();
				}

			case VIEW.OTHERS:
				switch (currentPage) {
					case "Pass Slip Record":
						return <PassSlipsHR isHead={isHead}/>
					case "Accomplishment Record": return <AccomplishmentRecord isHead={isHead}/>

					case "To Receive":
						return <ToReceieve userId={userId} departmentId={departmentId!} isHead={isHead} />;

					case "Ongoing":
						return <OngoingRequest userId={userId} departmentId={departmentId!} isHead={isHead} />;

					case "To Release":
						return <ToRelease userId={userId} departmentId={departmentId!} isHead={isHead} />;

					case "Declined":
						return (
							<RequestLogsTable
								key="request-logs-tabled-declined"
								title={currentPage}
								departmentId={departmentId!}
								action="DECLINED"
							/>
						);

					case "Completed":
						return (
							<RequestLogsTable
								key="request-logs-tabled-completed"
								title={currentPage}
								departmentId={departmentId!}
								action="COMPLETED"
							/>
						);

					case "Reviewed":
						return (
							<RequestLogsTable
								key="request-logs-tabled-reviewed"
								title={currentPage}
								departmentId={departmentId!}
								action="REVIEWED"
							/>
						);

					default:
						return getNotFound();
				}

			default:
				return getNotFound();
		}
	};


	return (
		<div className="flex h-screen bg-slate-50">
			{isAllowedPath && (
				<Nav
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
					isMobileOpen={isMobileOpen}
					setIsMobileOpen={setIsMobileOpen}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					targetMyself={targetMyself}
					departmentName={departmentName}
				/>
			)}

			<div className={`flex-1 flex flex-col ${isAllowedPath && (isCollapsed ? "md:ml-20" : "md:ml-72")}`}>
				{isAllowedPath && (
					<Header
						currentPage={currentPage}
						targetMyself={targetMyself}
						setTargetMyself={setTargetMyself}
						setCurrentPage={setCurrentPage}
					/>
				)}

				<main className="flex-1 overflow-y-auto">
					<Routes>
						<Route path="/" element={getComponent()} />
						<Route path="/profile" element={<UserProfile />} />
						<Route path="/requests/:id" element={<RequestView />} />
						<Route path="/pass-slip/:id" element={<ViewPassSlip />} />
						<Route path="/accomplishment/:id" element={<ViewAccomplishmentReport />} />
						<Route
							path="*"
							element={getNotFound()}
						/>
					</Routes>
					<Footer />
				</main>
			</div>

			<ToastContainer />
		</div>
	);
}