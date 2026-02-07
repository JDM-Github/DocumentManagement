import AdminUsersTable from "./admin-user-table";

export default function AllDepartmentUserTable({ isDean, isPresident, isMISD }: {
    isDean: boolean;
    isPresident: boolean;
    isMISD: boolean
}) {
    return <AdminUsersTable
        filter="DEPARTMENT"
        title="Department Users" 
        isMISD={isMISD}
        isDean={isDean}
        isPresident={isPresident}
    />
}
