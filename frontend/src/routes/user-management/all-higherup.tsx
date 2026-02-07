import AdminUsersTable from "./admin-user-table";

export default function AllHigherUp({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminUsersTable
        filter="HIGHERUP"
        title="All Higherup" 
        isMISD={isMISD}
        isDean={isDean}
        isPresident={isPresident}
    />
}
