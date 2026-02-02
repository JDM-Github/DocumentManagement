import MyRequests from "./myrequest";

export default function MyRequestOngoing({ userId, currentPage }: {userId: string; currentPage: string}) {
    return <MyRequests title={currentPage} userId={userId} status="ONGOING" />
}
