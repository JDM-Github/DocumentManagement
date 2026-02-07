import AdminSuggestionsTable from "./hr-suggestions";

export default function RejectedSuggestions({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminSuggestionsTable isDean={isDean} isPresident={isPresident} isMISD={isMISD} status="REJECTED" title="Rejected Suggestions & Problems" />;
}