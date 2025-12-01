import { ReactFlowProvider } from "reactflow";
import Skills from "./Skills";
import ReactFlow from "reactflow";

export default function SkillsWrapper(){
    return (
        <>
            <ReactFlowProvider>
                <Skills/>
            </ReactFlowProvider>
        </>
    )
}