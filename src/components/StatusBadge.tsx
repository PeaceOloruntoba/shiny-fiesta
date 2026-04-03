export default function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Paid: 'bg-green-50 text-brand',
        Success: 'bg-green-50 text-brand',
        Approved: 'bg-green-50 text-brand',
        Successful: 'bg-green-50 text-brand',
        Resolved: 'bg-green-50 text-brand',
        Active: 'bg-green-50 text-brand',
        Pending: 'bg-amber-50 text-amber-600',
        Unresolved: 'bg-gray-100 text-gray-500',
        Failed: 'bg-red-50 text-red-600',
        Rejected: 'bg-red-50 text-red-600',
        Inactive: 'bg-gray-100 text-gray-500',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-50'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styles[status]?.includes('brand') || styles[status]?.includes('green') ? 'bg-brand' : 'bg-gray-400'}`} />
            {status}
        </span>
    );
}