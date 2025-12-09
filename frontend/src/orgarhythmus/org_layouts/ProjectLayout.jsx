// orgarhythmus/org_layouts/ProjectLayout.jsx
import { Outlet, useParams } from "react-router-dom";
import ProjectHeader from "../projects/components/ProjectHeader"

export default function ProjectLayout() {
  const { projectId } = useParams();   // ⬅️ read from URL

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header always visible, gets the id */}
      <ProjectHeader projectId={projectId} />

      {/* Page content below header */}
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}
