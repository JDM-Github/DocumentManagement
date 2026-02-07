import {
  LayoutDashboard,
  FileText,
  Clock,
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  Users,
  FileSignature,
  FileCheck,
  ClipboardCheck,
  ClipboardList,
  User,
  UsersRound,
  GraduationCap,
  Award,
  Briefcase,
  HeartHandshake,
  BookOpen,
  Star,
  Info,
  Printer,
  Target,
  MessageSquare,
  Pencil,
  FilePlus,
  List,
  ArrowUpRight,
  CheckSquare,
  FileEdit,
  UserPlus,
  UserCheck,
  Shield,
} from "lucide-react";
import { NavItem } from "../lib/interface";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, isShownToDeanPresident: true, isShownToMISD: true },

  {
    label: "Documents",
    icon: FileText,
    isShownToDeanPresident: true,
    children: [
      { label: "Create Document", icon: Pencil, showOnlyToSelf: true },
      { label: "To Receive", icon: Inbox },
      { label: "Ongoing", icon: Clock },
      { label: "To Release", icon: Send },
      { label: "Document Logs", icon: List, showOnlyToSelf: true },
      { label: "Reviewed", icon: CheckCircle, hideInMyself: true },
      { label: "Declined", icon: XCircle, hideInMyself: false },
      { label: "Completed", icon: CheckSquare, hideInMyself: false },
      { label: "Not Approved", icon: XCircle, hideInMyself: false, showOnlyToSelf: false, isShownToDeanPresident: true, showOnlyToHigherup: true },
      { label: "Approved", icon: CheckCircle, hideInMyself: false, showOnlyToSelf: false, isShownToDeanPresident: true, showOnlyToHigherup: true },
    ],
  },

  {
    label: "HR Management",
    icon: Users,
    isShownToDeanPresident: true,
    children: [
      {
        label: "Pass Slip",
        icon: FileSignature,
        isShownToDeanPresident: true,
        children: [
          { label: "Create Pass Slip", icon: FilePlus, showOnlyToSelf: true },
          { label: "My Pass Slip", icon: ArrowUpRight, showOnlyToSelf: true },
          { label: "Pass Slip Record", icon: List, hideInMyself: true, isShownToDeanPresident: true },
        ]
      },
      {
        label: "Accomplishment",
        icon: ClipboardCheck,
        isShownToDeanPresident: true,
        children: [
          { label: "Create Accomplishment", icon: FilePlus, showOnlyToSelf: true },
          { label: "My Accomplishment", icon: ArrowUpRight, showOnlyToSelf: true },
          { label: "Accomplishment Record", icon: List, hideInMyself: true, isShownToDeanPresident: true },
        ]
      },
      {
        label: "Clearance",
        icon: FileCheck,
        isShownToDeanPresident: true,
        children: [
          { label: "Create Clearance", icon: FilePlus, showOnlyToSelf: true },
          { label: "My Clearance", icon: ArrowUpRight, showOnlyToSelf: true },
          { label: "Clearance Record", icon: List, hideInMyself: true, isShownToDeanPresident: true },
        ]
      },
      {
        label: "Travel Order",
        icon: FileCheck,
        isShownToDeanPresident: true,
        children: [
          { label: "Create Travel Order", icon: FilePlus, showOnlyToSelf: true },
          { label: "My Travel Order", icon: ArrowUpRight, showOnlyToSelf: true },
          { label: "Travel Order Record", icon: List, hideInMyself: true, isShownToDeanPresident: true },
        ]
      },
    ],
  },

  {
    label: "Personal Data Sheet",
    icon: ClipboardList,
    showOnlyToSelf: true,
    children: [
      { label: "Personal Information", icon: User },
      { label: "Family Background", icon: UsersRound },
      { label: "Educational Background", icon: GraduationCap },
      { label: "Civil Service Eligibility", icon: Award },
      { label: "Work Experience", icon: Briefcase },
      { label: "Voluntary Work", icon: HeartHandshake },
      { label: "Learning and Development", icon: BookOpen },
      { label: "Skills and Hobbies", icon: Star },
      { label: "Other Information", icon: Info },
      { label: "Reference", icon: Info },
      { label: "Print / View", icon: Printer },
    ],
  },

  {
    label: "Faculty Evaluation",
    icon: Target,
    showOnlyToSelf: true,
    children: [
      { label: "Evaluate Faculty Member", icon: FileEdit },
      { label: "My Faculty Evaluation", icon: ArrowUpRight },
      { label: "My Evaluation Received", icon: ArrowUpRight },
      { label: "My QR Code", icon: Info },
      { label: "My Evaluation Student", icon: ArrowUpRight },
    ],
  },

  {
    label: "Flag Ceremony",
    icon: Target,
    showOnlyToSelf: true,
    children: [
      { label: "Record FC Attendance", icon: ClipboardCheck },
      { label: "My FC Record", icon: List },
    ],
  },

  {
    isShownToDeanPresident: true,
    isShownToMISD: true,
    showOnlyToSelf: true,
    label: "Suggestion / Problem",
    icon: MessageSquare,
    children: [
      { label: "Create S|P", icon: FilePlus, showOnlyToSelf: true, isShownToDeanPresident: true, isShownToMISD: false },
      { label: "My S|P Record", icon: ArrowUpRight, showOnlyToSelf: true, isShownToDeanPresident: true, isShownToMISD: false },
      { label: "Pending S|P", icon: Clock, showOnlyToHigherup: true, isShownToDeanPresident: true, isShownToMISD: true },
      { label: "Under Review S|P", icon: FileEdit, showOnlyToHigherup: true, isShownToDeanPresident: true, isShownToMISD: true },
      { label: "In Progress S|P", icon: Clock, showOnlyToHigherup: true, isShownToDeanPresident: true, isShownToMISD: true },
      { label: "Resolved S|P", icon: CheckCircle, showOnlyToHigherup: true, isShownToDeanPresident: true, isShownToMISD: true },
      { label: "Rejected S|P", icon: XCircle, showOnlyToHigherup: true, isShownToDeanPresident: true, isShownToMISD: true },
    ],
  },

  {
    isShownToDeanPresident: true,
    isShownToMISD: true,
    label: "User Management",
    icon: Users,
    children: [
      {
        label: "Create User",
        icon: UserPlus,
        showOnlyToSelf: true,
        showOnlyToHigherup: true,
        isShownToDeanPresident: false,
        isShownToMISD: true,
      },
      {
        label: "All User",
        icon: Users,
        showOnlyToSelf: true,
        showOnlyToHigherup: true,
        isShownToDeanPresident: true,
        isShownToMISD: true,
      },
      {
        label: "All Head User",
        icon: UserCheck,
        showOnlyToSelf: true,
        showOnlyToHigherup: true,
        isShownToDeanPresident: true,
        isShownToMISD: true,
      },
      {
        label: "All MISD User",
        icon: Shield,
        showOnlyToSelf: true,
        showOnlyToHigherup: true,
        isShownToDeanPresident: true,
        isShownToMISD: true,
      },
      {
        label: "All Higherup User",
        icon: Shield,
        showOnlyToSelf: true,
        showOnlyToHigherup: true,
        isShownToDeanPresident: true,
        isShownToMISD: true,
      },
      {
        label: "All Department User",
        icon: User,
        isShownToDeanPresident: false,
        isShownToMISD: false,
      },
    ],
  },

  {
    isShownToDeanPresident: true,
    isShownToMISD: true,
    showOnlyToHigherup: true,
    label: "Announcement Management",
    icon: Users,
    children: [
      {
        label: "Create Announcement",
        icon: UserPlus,
        isShownToDeanPresident: false,
        isShownToMISD: true,
      },
      {
        label: "All Announcement",
        icon: UserPlus,
        isShownToDeanPresident: false,
        isShownToMISD: true,
      },
    ],
  },

];
