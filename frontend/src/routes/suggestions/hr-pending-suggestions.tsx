import AdminSuggestionsTable from "./hr-suggestions";

export default function PendingSuggestions({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminSuggestionsTable isDean={isDean} isPresident={isPresident} isMISD={isMISD} status="PENDING" title="Pending Suggestions & Problems" />;
}