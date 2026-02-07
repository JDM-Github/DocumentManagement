import AdminUsersTable from "./admin-user-table";

export default function AllHeadTable({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminUsersTable
        filter="HEAD"
        title="Department Heads" 
        isMISD={isMISD}
        isDean={isDean}
        isPresident={isPresident}
    />
}
