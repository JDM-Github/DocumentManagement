import AdminUsersTable from "./admin-user-table";

export default function AllMISDTable({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminUsersTable
        filter="MISD"
        title="MISD Users"
        isMISD={isMISD}
        isDean={isDean}
        isPresident={isPresident}
    />
}
