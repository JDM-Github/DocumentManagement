import { useState } from "react";
import HigherUpRequest from "./higherup_request";

export default function ApprovedRequest({
    isDean,
    isPresident,
}: {
    isDean: boolean;
    isPresident: boolean;
}) {
    const [toggleRefresh, _] = useState(false);
    return (
        <>
            <HigherUpRequest
                toggleRefresh={toggleRefresh}
                title="Approved"
                status="Approved"
                isDean={isDean}
                isPresident={isPresident}
            />

        </>
    );
}