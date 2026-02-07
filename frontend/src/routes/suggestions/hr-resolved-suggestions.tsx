import AdminSuggestionsTable from "./hr-suggestions";

export default function ResolvedSuggestions({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminSuggestionsTable isDean={isDean} isPresident={isPresident} isMISD={isMISD} status="RESOLVED" title="Resolved Suggestions & Problems" />;
}