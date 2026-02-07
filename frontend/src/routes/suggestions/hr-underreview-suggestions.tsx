import AdminSuggestionsTable from "./hr-suggestions";

export default function UnderReviewSuggestions({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminSuggestionsTable isDean={isDean} isPresident={isPresident} isMISD={isMISD} status="UNDER_REVIEW" title="Under Review" />;
}