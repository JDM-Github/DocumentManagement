import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Copy,
    FileDown,
    FileSpreadsheet,
    FileText,
    Printer,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal,
    X,
    Loader2,
} from 'lucide-react';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    icon?: React.ReactNode;
    width?: string;
}

export interface AdditionalButton {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    bg?: string;
    hover?: string;
    text?: string;
    disabled?: boolean;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    expandable?: boolean;
    renderExpandedRow?: (row: any) => React.ReactNode;
    renderActions?: (row: any) => React.ReactNode;
    rowsPerPageOptions?: number[];
    title?: string;
    loading?: boolean;
    additionalButtons?: AdditionalButton[];
    selectable?: boolean;
    onSelectionChange?: (selectedRows: any[]) => void;
}


export default function DataTable({
    columns,
    data,
    expandable = false,
    renderExpandedRow,
    renderActions,
    rowsPerPageOptions = [5, 10, 25, 50, 100],
    title = 'Data Table',
    loading = false,
    additionalButtons = [],
    selectable = false,
    onSelectionChange

}: DataTableProps) {
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[1]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

    const filteredData = useMemo(() => {
        let filtered = data.filter((row) => {
            const matchesSearch = Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );

            const matchesColumnFilters = Object.entries(columnFilters).every(
                ([key, filterValue]) => {
                    if (!filterValue) return true;
                    return String(row[key])
                        .toLowerCase()
                        .includes(filterValue.toLowerCase());
                }
            );

            return matchesSearch && matchesColumnFilters;
        });

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortConfig, columnFilters]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return {
                    key,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc',
                };
            }
            return { key, direction: 'asc' };
        });
    };

    const toggleRow = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    const copyToClipboard = () => {
        const text = [
            columns.map((col) => col.label).join('\t'),
            ...filteredData.map((row) =>
                columns.map((col) => row[col.key]).join('\t')
            ),
        ].join('\n');
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const exportCSV = () => {
        const csv = [
            columns.map((col) => col.label).join(','),
            ...filteredData.map((row) =>
                columns.map((col) => `"${row[col.key]}"`).join(',')
            ),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        a.click();
    };

    const exportExcel = () => {
        const html = `
			<table>
				<thead>
					<tr>${columns.map((col) => `<th>${col.label}</th>`).join('')}</tr>
				</thead>
				<tbody>
					${filteredData.map((row) => `<tr>${columns.map((col) => `<td>${row[col.key]}</td>`).join('')}</tr>`).join('')}
				</tbody>
			</table>
		`;
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.xls';
        a.click();
    };

    const exportPDF = () => {
        const printContent = document.getElementById('data-table-print');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f3f4f6; font-weight: bold; }
                        h2 { margin-bottom: 20px; color: #1e293b; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const printTable = () => {
        exportPDF();
    };


    useEffect(() => {
        if (onSelectionChange) {
            const selectedData = filteredData.filter((_, index) => selectedRows.has(index));
            onSelectionChange(selectedData);
        }
    }, [selectedRows, filteredData, onSelectionChange]);

    const toggleRowSelection = (index: number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedRows(newSelected);
    };

    const toggleSelectAll = () => {
        const allRowIndices = paginatedData.map((_, index) =>
            filteredData.findIndex(row => row === paginatedData[index])
        );
        const allSelectedOnPage = allRowIndices.every(index => selectedRows.has(index));
        const newSelected = new Set(selectedRows);
        if (allSelectedOnPage) {
            allRowIndices.forEach(index => newSelected.delete(index));
        } else { allRowIndices.forEach(index => newSelected.add(index)); }
        setSelectedRows(newSelected);
    };

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="text-slate-700 font-medium">Loading data...</p>
                    </div>
                </div>
            )}

            <div id="data-table-print" className="hidden">
                <h2>{title}</h2>
                <table>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, index) => (
                            <tr key={index}>
                                {columns.map((col) => (
                                    <td key={col.key}>{row[col.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {additionalButtons.map((button, index) => (
                            <button
                                key={index}
                                onClick={button.onClick}
                                disabled={button.disabled || loading}
                                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${button.bg} ${button.hover} ${button.text}`}
                                title={button.label}
                            >
                                {button.icon}
                                <span className="hidden sm:inline">{button.label}</span>
                            </button>))
                        }
                        <button
                            onClick={copyToClipboard}
                            disabled={loading}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Copy"
                        >
                            <Copy size={16} />
                            <span className="hidden sm:inline">Copy</span>
                        </button>
                        <button
                            onClick={exportCSV}
                            disabled={loading}
                            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Export CSV"
                        >
                            <FileDown size={16} />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button
                            onClick={exportExcel}
                            disabled={loading}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Export Excel"
                        >
                            <FileSpreadsheet size={16} />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={loading}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Export PDF"
                        >
                            <FileText size={16} />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                            onClick={printTable}
                            disabled={loading}
                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Print"
                        >
                            <Printer size={16} />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        disabled={loading}
                        className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed ${showFilters
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200">
                        {columns
                            .filter((col) => col.filterable !== false)
                            .map((col) => (
                                <div key={col.key} className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        {col.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={`Filter ${col.label}...`}
                                            value={columnFilters[col.key] || ''}
                                            onChange={(e) => {
                                                setColumnFilters((prev) => ({
                                                    ...prev,
                                                    [col.key]: e.target.value,
                                                }));
                                                setCurrentPage(1);
                                            }}
                                            disabled={loading}
                                            className="w-full pr-8 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        {columnFilters[col.key] && (
                                            <button
                                                onClick={() => {
                                                    setColumnFilters((prev) => ({
                                                        ...prev,
                                                        [col.key]: '',
                                                    }));
                                                }}
                                                disabled={loading}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {selectable && (
                                <th className="w-12 px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={paginatedData.length > 0 && paginatedData.every((row, _) => {
                                                const dataIndex = filteredData.findIndex(d => d === row);
                                                return selectedRows.has(dataIndex);
                                            })}
                                            onChange={toggleSelectAll}
                                            disabled={loading || paginatedData.length === 0}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                            aria-label="Select all rows"
                                        />
                                    </div>
                                </th>
                            )}
                            {expandable && <th className="w-10"></th>}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-sm font-semibold text-slate-700"
                                    style={{ width: col.width }}
                                >
                                    <button
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {col.icon && <span className="text-slate-500">{col.icon}</span>}
                                        {col.label}
                                        {col.sortable !== false && (
                                            <span className="flex flex-col -space-y-1.5">
                                                <ChevronUp
                                                    size={14}
                                                    className={
                                                        sortConfig?.key === col.key &&
                                                            sortConfig.direction === 'asc'
                                                            ? 'text-blue-600'
                                                            : 'text-slate-400'
                                                    }
                                                />
                                                <ChevronDown
                                                    size={14}
                                                    className={
                                                        sortConfig?.key === col.key &&
                                                            sortConfig.direction === 'desc'
                                                            ? 'text-blue-600'
                                                            : 'text-slate-400'
                                                    }
                                                />
                                            </span>
                                        )}
                                    </button>
                                </th>
                            ))}
                            {renderActions && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-24">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginatedData.map((row, index) => {
                            const dataIndex = filteredData.findIndex(d => d === row);
                            return <>
                                <tr
                                    key={index}
                                    className={`hover:bg-slate-50 transition-colors ${selectedRows.has(dataIndex) ? 'bg-blue-50' : ''}`}
                                >
                                    {selectable && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(dataIndex)}
                                                    onChange={() => toggleRowSelection(dataIndex)}
                                                    disabled={loading}
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                    aria-label={`Select row ${index + 1}`}
                                                />
                                            </div>
                                        </td>
                                    )}
                                    {expandable && (
                                        <td className="px-4 py-2.5">
                                            <button
                                                onClick={() => toggleRow(index)}
                                                disabled={loading}
                                                className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {expandedRows.has(index) ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </button>
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-4 py-3 text-sm text-slate-700"
                                        >
                                            {row[col.key]}
                                        </td>
                                    ))}
                                    {renderActions && (
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                {renderActions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                                {expandable && expandedRows.has(index) && (
                                    <tr>
                                        <td
                                            colSpan={columns.length + (renderActions ? 2 : 1)}
                                            className="px-4 py-4 bg-slate-50"
                                        >
                                            {renderExpandedRow?.(row)}
                                        </td>
                                    </tr>
                                )}
                            </>
                        })}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden divide-y divide-slate-200">
                {paginatedData.map((row, index) => {
                    const dataIndex = filteredData.findIndex(d => d === row);
                    return <div key={index} className={`p-4 ${selectedRows.has(dataIndex) ? 'bg-blue-50' : ''}`}>
                        {selectable && (
                            <div className="mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.has(dataIndex)}
                                    onChange={() => toggleRowSelection(dataIndex)}
                                    disabled={loading}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                    aria-label={`Select row ${index + 1}`}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            {columns.map((col) => (
                                <div key={col.key} className="flex justify-between items-start gap-2">
                                    <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                        {col.icon && <span className="text-slate-500">{col.icon}</span>}
                                        {col.label}:
                                    </span>
                                    <span className="text-sm text-slate-900 text-right">
                                        {row[col.key]}
                                    </span>
                                </div>
                            ))}
                            {renderActions && (
                                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
                                    {renderActions(row)}
                                </div>
                            )}
                        </div>
                        {expandable && (
                            <>
                                <button
                                    onClick={() => toggleRow(index)}
                                    disabled={loading}
                                    className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {expandedRows.has(index) ? (
                                        <>
                                            <ChevronUp size={16} /> Hide Details
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={16} /> Show Details
                                        </>
                                    )}
                                </button>
                                {expandedRows.has(index) && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        {renderExpandedRow?.(row)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                })}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-slate-600">Rows:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                            className="px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {rowsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span className="text-slate-600">
                            {(currentPage - 1) * rowsPerPage + 1}-
                            {Math.min(currentPage * rowsPerPage, filteredData.length)} of{' '}
                            {filteredData.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1 || loading}
                            className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="First page"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Previous page"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex gap-1.5">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        disabled={loading}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }
                            disabled={currentPage === totalPages || loading}
                            className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Next page"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || loading}
                            className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Last page"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
