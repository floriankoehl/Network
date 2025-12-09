

import { ReactFlowProvider } from "reactflow";
import OrgAttempts from "./OrgAttempts";


export default function OrgAttemptsWrapper() {
    return (
        <>
            <ReactFlowProvider>
                <div className="h-full bg-black/5">
                    <OrgAttempts/>
                </div>
                
            </ReactFlowProvider>
        </>
    )
}





