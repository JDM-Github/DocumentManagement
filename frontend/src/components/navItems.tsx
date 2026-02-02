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
  Plane,
  CalendarOff,
  ClipboardCheck,
  FolderOpen,
  FileInput,
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
  UserCheck,
  FileBadge,
  MessageSquare,
  Pencil,
  FilePlus
} from "lucide-react";
import { NavItem } from "../lib/interface";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },

  {
    label: "Documents",
    icon: FileText,
    children: [
      { label: "Create Document", icon: Pencil, showOnlyToSelf: true },
      { label: "To Receive", icon: Inbox },
      { label: "Ongoing", icon: Clock },
      { label: "To Release", icon: Send },
      { label: "Document Logs", icon: CheckCircle, showOnlyToSelf: true },
      { label: "Reviewed", icon: CheckCircle, hideInMyself: true },
      { label: "Declined", icon: XCircle, hideInMyself: false },
      { label: "Completed", icon: CheckCircle, hideInMyself: false },
    ],
  },

  {
    label: "HR Management",
    icon: Users,
    children: [
      {
        label: "Pass Slip", icon: FileSignature,
        children: [
          { label: "Create Pass Slip", icon: FilePlus, showOnlyToSelf: true },
          { label: "My Pass Slip", icon: FilePlus, showOnlyToSelf: true },
          { label: "Pass Slip Record", icon: FilePlus, hideInMyself: true },
        ]
      },
      {
        label: "Accomplishment", icon: ClipboardCheck,
        children: [
          { label: "Create Accomplishment", icon: FilePlus, showOnlyToSelf: true },
          { label: "My Accomplishment", icon: FilePlus, showOnlyToSelf: true },
          { label: "Accomplishment Record", icon: FilePlus, hideInMyself: true },
        ]
      },
      { label: "Clearance", icon: FileCheck },
      { label: "Travel Order", icon: Plane },
      { label: "Leave Form", icon: CalendarOff },
      { label: "Request Slip", icon: FileInput },
      { label: "DTR Request Form", icon: ClipboardCheck },
    ],
  },

  // {
  //   label: "Records Office",
  //   icon: FolderOpen,
  //   showOnlyToSelf: true,
  //   children: [
  //     { label: "Document Request", icon: FileInput },
  //   ],
  // },

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
      { label: "Individual", icon: UserCheck },
      { label: "ACAD-SF-008 Individual", icon: FileBadge },
      // { label: "Joint Circular No. 3", icon: FileText },
    ],
  },

  { label: "Suggestion / Problem", icon: MessageSquare },
];
