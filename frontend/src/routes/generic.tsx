import DataTable from "../components/Table";
import { Briefcase, Calendar, Edit, Eye, Mail, Trash2 } from "lucide-react";

export default function GenericPage({ title }: { title: string }) {
    const columns = [
        { key: 'id', label: 'ID', sortable: true, width: '60px' },
        { key: 'name', label: 'Name', sortable: true, icon: <Mail size={14} /> },
        { key: 'email', label: 'Email', sortable: true, icon: <Mail size={14} /> },
        { key: 'department', label: 'Department', sortable: true, icon: <Briefcase size={14} /> },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'date', label: 'Date', sortable: true, icon: <Calendar size={14} /> },
    ];

    const data = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        department: ['IT', 'HR', 'Finance', 'Marketing'][i % 4],
        status: ['Active', 'Inactive', 'Pending'][i % 3],
        date: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString(),
    }));

    const renderExpandedRow = (row: any) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Additional Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-slate-600">Full Name:</span>
                    <span className="ml-2 font-medium">{row.name}</span>
                </div>
                <div>
                    <span className="text-slate-600">Contact:</span>
                    <span className="ml-2 font-medium">{row.email}</span>
                </div>
                <div>
                    <span className="text-slate-600">Department:</span>
                    <span className="ml-2 font-medium">{row.department}</span>
                </div>
                <div>
                    <span className="text-slate-600">Account Status:</span>
                    <span
                        className={`ml-2 font-medium ${row.status === 'Active' ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {row.status}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderActions = (row: any) => (
        <>
            <button
                onClick={() => alert(`View user ${row.id}`)}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                title="View"
            >
                <Eye size={14} />
            </button>
            <button
                onClick={() => alert(`Edit user ${row.id}`)}
                className="p-1.5 hover:bg-amber-100 text-amber-600 rounded transition-colors"
                title="Edit"
            >
                <Edit size={14} />
            </button>
            <button
                onClick={() => alert(`Delete user ${row.id}`)}
                className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                title="Delete"
            >
                <Trash2 size={14} />
            </button>
        </>
    );

    return (
        <div className="p-4 sm:p-6 gap-3">
            <DataTable
                title={title}
                columns={columns}
                data={data}
                expandable={true}
                renderExpandedRow={renderExpandedRow}
                renderActions={renderActions}
            />
            {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
                <p className="text-slate-600">{title} content goes here...</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                        <h3 className="font-medium text-slate-900 mb-2">Section 1</h3>
                        <p className="text-sm text-slate-600">Additional information and content for {title}.</p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                        <h3 className="font-medium text-slate-900 mb-2">Section 2</h3>
                        <p className="text-sm text-slate-600">Additional information and content for {title}.</p>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
