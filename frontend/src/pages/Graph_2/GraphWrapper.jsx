import { ReactFlowProvider } from 'reactflow';
import Graph_3 from './Graph_3';

export default function GraphWrapper() {
  return (
    <div>
        <ReactFlowProvider>
      <Graph_3 />
    </ReactFlowProvider>
    </div>
    
  );
}
