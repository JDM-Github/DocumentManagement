import MyRequests from "./myrequest";


export default function MyRequestToReceived({ userId, currentPage }: { userId: string; currentPage: string }) {
    return <MyRequests title={currentPage} userId={userId} status="TO_RECEIVE"  />
}
