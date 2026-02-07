import AdminSuggestionsTable from "./hr-suggestions";

export default function InProgressSuggestions({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminSuggestionsTable isDean={isDean} isPresident={isPresident} isMISD={isMISD} status="IN_PROGRESS" title="In Progress" />;
}