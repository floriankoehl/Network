// Skills.jsx
import { Brain, MousePointerClick } from "lucide-react";
import ReactFlow, {
  MiniMap,
  Background,
  Handle,
  useReactFlow,
} from "reactflow";
import { BASE_URL } from "../../config/api";
import { useLoaderData } from "react-router-dom";
import { useState, useEffect } from "react";

// =====================
// Loader
// =====================
export async function skills_loader_function() {
  const res = await fetch(`${BASE_URL}/api/skills/dummy_data/`);
  if (!res) {
    console.log(res);
    return { nodes: [], edges: [] };
  }
  const answer = await res.json();
  console.log(answer);

  const nodes = [{ id: "root", type: "main", position: { x: 0, y: 0 } }];

  const headlines = Object.keys(answer.data);
  console.log("headlines", headlines);

  const headline_nodes = headlines.map((head, index) => {
    return {
      id: head,
      type: "second_layer",
      position: { x: (index + 1) * 180 - 450, y: 150 }, // 150px vertical spacing
      data: {
        title: head,
        layer: 2,
      },
      hidden: true, // start collapsed
    };
  });

  nodes.push(...headline_nodes);
  console.log("nodes", nodes);

  const layer_1_edges = headlines.map((head, index) => {
    return {
      id: `root-${head}-${index}`,
      source: "root",
      target: head,
    };
  });

  return {
    nodes,
    edges: layer_1_edges,
  };
}

// =====================
// Node components
// =====================
function MainNode({ data }) {
  return (
    <div
      onClick={() => {
        data.onExpandCollapse();
      }}
      className="
        h-20 w-40
        rounded-2xl
        bg-white/20
        backdrop-blur-xl
        border border-white/40
        shadow-[0_8px_32px_rgba(31,38,135,0.15)]
        flex justify-center items-center gap-3
        text-white
        relative
        hover:bg-white/40
        active:bg-white/80
        transition-all duration-300 ease-out
      "
    >
      <Brain />
      <h1>My Skills</h1>
      <MousePointerClick
        className="
          absolute 
          -bottom-3
          -right-1
          h-6 w-6 
          animate-bounce
        "
      />
      <Handle type="source" position="bottom" />
    </div>
  );
}

function SecondLayerNode({ data }) {
  return (
    <div
      className="
        h-20 w-40
        rounded-2xl
        bg-blue-200/40
        backdrop-blur-xl
        border border-white/40
        shadow-[0_8px_32px_rgba(31,38,135,0.15)]
        flex justify-center items-center gap-3
        text-white
        relative
        hover:bg-blue-200/60
        active:bg-blue-200/100
        transition-all duration-300 ease-out
      "
    >
      <h1>{data.title}</h1>
      <Handle type="source" position="bottom" />
      <Handle type="target" position="top" />
    </div>
  );
}

const nodeTypes = {
  main: MainNode,
  second_layer: SecondLayerNode,
};

// =====================
// 🔑 AlwaysFitView – runs fitView on EVERY render,
// inside ReactFlow's context and timing
// =====================
function AlwaysFitView() {
  const reactFlow = useReactFlow();

  useEffect(() => {
    // wait until ReactFlow has done its own layout / internal updates
    requestAnimationFrame(() => {
      reactFlow.fitView({ padding: 0.3, duration: 300 });
    });
  });

  return null; // no visible UI
}

// =====================
// Main Skills component
// =====================
export default function Skills() {
  const data = useLoaderData();
  const [nodes, setNodes] = useState(data.nodes ?? []);
  const [edges] = useState(data.edges ?? []);
  const [num, setNum] =  useState(0)

  console.log("loader data", data);

  // toggle show/hide second-layer nodes by changing "hidden"
  function expand_collapse_second_layer() {
    setNodes((prev) => {
      const anyVisible = prev.some(
        (n) => n.type === "second_layer" && !n.hidden
      );
      
      setNum(num +2)
      console.log(num)

      return prev.map((node) =>
        node.type === "second_layer"
          ? { ...node, hidden: anyVisible } // if any visible -> hide all; else show all
          : node
      );

     
    });
  }

  // inject onExpandCollapse handler into data of all nodes (esp. root)
  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...(node.data ?? {}),
          onExpandCollapse: expand_collapse_second_layer,
        },
      }))
    );
  }, []);

  return (
    <div className="h-screen w-screen bg-white flex justify-center items-center">
      <ReactFlow
        style={{ backgroundColor: "#202020ff" }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
                            fitViewOptions={{ padding: 0.3 }}
      >
        {/* 🔥 this forces fitView on EVERY render, AFTER RF updated */}
        <AlwaysFitView />

        <Background variant="dots" gap={22} size={1} color="#e7e7e7bc" />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
