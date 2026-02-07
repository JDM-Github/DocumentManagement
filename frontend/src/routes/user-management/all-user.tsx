import AdminUsersTable from "./admin-user-table";

export default function AllUserTable({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminUsersTable
        filter="ALL"
        title="All Users"
        isMISD={isMISD}
        isDean={isDean}
        isPresident={isPresident}
    />
}
