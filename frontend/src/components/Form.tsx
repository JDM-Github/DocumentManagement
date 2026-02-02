import { useState, ReactNode, useEffect, useRef } from 'react';
import {
    X,
    Trash2,
    Edit,
    Plus
} from 'lucide-react';

interface FormField {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    icon?: ReactNode;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    validation?: (value: any) => string | undefined;
    options?: { value: string; label: string }[];
    rows?: number;
    accept?: string;
    multiple?: boolean;
    min?: string;
    max?: string;
    section?: string; // NEW: Group fields by section
    render?: (value: any, onChange: (val: any) => void, hasError: boolean) => ReactNode;
}

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export function DynamicForm({
    isModal = true,
    isOpen = true,
    onClose,
    title = 'Form',
    fields = [] as FormField[],
    onSubmit,
    initialData = {},
    actionType = 'CREATE',
    submitButtonText,
    size = 'md',
    className = '',
}: {
    isModal?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    title?: string;
    fields?: FormField[];
    onSubmit?: (data: any) => void;
    initialData?: any;
    actionType?: ActionType;
    submitButtonText?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}) {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formatDateTimeValue = (value: any, type: string) => {
        if (!value) return '';

        try {
            const date = new Date(value);

            // Check if valid date
            if (isNaN(date.getTime())) return '';

            switch (type) {
                case 'datetime-local':
                    // Format: YYYY-MM-DDTHH:mm
                    return date.toISOString().slice(0, 16);
                case 'date':
                    // Format: YYYY-MM-DD
                    return date.toISOString().split('T')[0];
                case 'time':
                    // Format: HH:mm
                    return date.toISOString().slice(11, 16);
                case 'month':
                    // Format: YYYY-MM
                    return date.toISOString().slice(0, 7);
                case 'week':
                    // Format: YYYY-Www (complex, just return date)
                    return date.toISOString().split('T')[0];
                default:
                    return value;
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    const processInitialData = (data: any) => {
        const processed = { ...data };

        fields.forEach((field) => {
            if (['date', 'datetime-local', 'time', 'month', 'week'].includes(field.type)) {
                if (processed[field.name]) {
                    processed[field.name] = formatDateTimeValue(processed[field.name], field.type);
                }
            }
        });
        return processed;
    };

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        if (!initialData || Object.keys(initialData).length === 0) return;

        setFormData(processInitialData(initialData));
        initializedRef.current = true;
    }, [initialData]);

    const handleChange = (fieldName: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
        if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        fields.forEach((field) => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }
            if (field.validation && formData[field.name]) {
                const validationError = field.validation(formData[field.name]);
                if (validationError) {
                    newErrors[field.name] = validationError;
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            if (onSubmit) {
                onSubmit(formData);
            }
            setFormData({});
            setErrors({});
        }
    };

    const handleClose = () => {
        setFormData(processInitialData(initialData));
        setErrors({});
        if (onClose) onClose();
    };

    const sizeClasses = {
        sm: 'max-w-xl',
        md: 'max-w-3xl',
        lg: 'max-w-5xl',
        xl: 'max-w-7xl',
    };

    const actionConfig = {
        CREATE: { icon: Plus, color: 'bg-green-600 hover:bg-green-700', text: 'Create' },
        UPDATE: { icon: Edit, color: 'bg-blue-600 hover:bg-blue-700', text: 'Update' },
        DELETE: { icon: Trash2, color: 'bg-red-600 hover:bg-red-700', text: 'Delete' },
    };

    const config = actionConfig[actionType as ActionType] || actionConfig.CREATE;
    const ActionIcon = config.icon;
    const buttonText = submitButtonText || config.text;

    const renderField = (field: FormField) => {
        const value = formData[field.name] || '';
        const hasError = errors[field.name];

        const baseInputClass = `w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${hasError
            ? 'border-red-300 focus:ring-red-500'
            : 'border-slate-300 focus:ring-blue-500'
            }`;

        const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'url':
            case 'tel':
                return (
                    <div key={field.name} className={field.className || 'col-span-1'}>
                        <label className={labelClass}>
                            {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type={field.type}
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            className={baseInputClass}
                        />
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name} className={field.className || 'col-span-2'}>
                        <label className={labelClass}>
                            {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <textarea
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            rows={field.rows || 4}
                            className={baseInputClass}
                        />
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.name} className={field.className || 'col-span-1'}>
                        <label className={labelClass}>
                            {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            disabled={field.disabled}
                            className={baseInputClass}
                        >
                            <option value="">{field.placeholder || 'Select an option'}</option>
                            {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'date':
            case 'datetime-local':
            case 'time':
            case 'month':
            case 'week':
                return (
                    <div key={field.name} className={field.className || 'col-span-1'}>
                        <label className={labelClass}>
                            {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type={field.type}
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            disabled={field.disabled}
                            min={field.min}
                            max={field.max}
                            className={baseInputClass}
                        />
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.name} className={field.className || 'col-span-2'}>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value || false}
                                onChange={(e) => handleChange(field.name, e.target.checked)}
                                disabled={field.disabled}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">
                                {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                        </label>
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.name} className={field.className || 'col-span-2'}>
                        <label className={labelClass}>
                            {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {field.options?.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={field.name}
                                        value={option.value}
                                        checked={value === option.value}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        disabled={field.disabled}
                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'file':
                return (
                    <div key={field.name} className={field.className || 'col-span-2'}>
                        <label className={labelClass}>
                            {field.icon && <span className="inline-block mr-1">{field.icon}</span>}
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type="file"
                            onChange={(e) => handleChange(field.name, e.target.files?.[0])}
                            disabled={field.disabled}
                            accept={field.accept}
                            multiple={field.multiple}
                            className={baseInputClass}
                        />
                        {value && typeof value === 'string' && (
                            <p className="text-xs text-slate-600 mt-1.5">Current file: {value}</p>
                        )}
                        {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]}</p>}
                    </div>
                );

            case 'custom':
                return (
                    <div key={field.name} className={field.className || 'col-span-2'}>
                        {field.render && field.render(value, (val) => handleChange(field.name, val), !!hasError)}
                    </div>
                );

            default:
                return null;
        }
    };

    const formContent = (
        <div className={`bg-white rounded-xl shadow-lg ${!isModal ? className : ''} ${!isModal ? sizeClasses[size] : ''} ${!isModal ? 'w-full' : ''}`}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-xl">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                {isModal && onClose && (
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex flex-col">
                <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: isModal ? '60vh' : 'none' }}>
                    {(() => {
                        // Group fields by section
                        const fieldsBySection: Record<string, FormField[]> = {};
                        const noSectionFields: FormField[] = [];

                        fields.forEach((field) => {
                            if (field.section) {
                                if (!fieldsBySection[field.section]) {
                                    fieldsBySection[field.section] = [];
                                }
                                fieldsBySection[field.section].push(field);
                            } else {
                                noSectionFields.push(field);
                            }
                        });

                        return (
                            <div className="space-y-6">
                                {/* Render fields without sections first */}
                                {noSectionFields.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {noSectionFields.map((field) => renderField(field))}
                                    </div>
                                )}

                                {/* Render sections */}
                                {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                                    <div key={sectionName} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                            <h3 className="text-base font-bold text-slate-800">
                                                {sectionName}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4">
                                            {sectionFields.map((field) => renderField(field))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-5 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                    {onClose && (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${config.color}`}
                    >
                        <ActionIcon size={18} />
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!isModal) {
        return isOpen ? formContent : null;
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className={`w-full ${sizeClasses[size]} my-8`}>
                {formContent}
            </div>
        </div>
    );
}