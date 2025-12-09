// orgarhythmus/projects/pages/ProjectMain.jsx
import { useLoaderData, useNavigate } from "react-router-dom";
import { Folder, Calendar, User, ArrowLeft } from "lucide-react";

// loader function used in router
import { fetch_project_detail } from "../../org_API";

export async function project_loader({ params }) {
  const { projectId } = params;
  return await fetch_project_detail(projectId);
}

export default function ProjectMain() {
  const project = useLoaderData();
  const navigate = useNavigate();

  const createdDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : "";

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-slate-50 to-slate-100 flex justify-center">
      <div className="w-full max-w-5xl px-4 pt-24 pb-10 flex flex-col gap-6">
        {/* Top: Back button */}
        <button
          onClick={() => navigate("/orgarhythmus/projects")}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Zur Projektübersicht
        </button>

        {/* Header card */}
        <section className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow">
                <Folder size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {project.name}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Dein OrgaRhythmus-Projekt. Hier hängen später Tasks, Teams und Abhängigkeiten dran.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <User size={12} />
              <span>Owner: {project.owner_username}</span>
            </span>

            {createdDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Calendar size={12} />
                <span>Erstellt am {createdDate}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Projekt-ID: {project.id}</span>
            </span>
          </div>
        </section>

        {/* Description card */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm p-5 sm:p-6">
          <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
            Beschreibung
          </h2>
          {project.description ? (
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500 italic">
              Noch keine Beschreibung hinterlegt.
            </p>
          )}
        </section>

        {/* Placeholder for future boards (super simple) */}
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 sm:p-6">
          <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
            Nächste Schritte
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Später kannst du hier das Projekt mit Tasks, Teams und Timelines verbinden.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Aktuell ist das Projekt nur als Container angelegt – genau richtig für diesen Schritt. ✨
          </p>
        </section>
      </div>
    </div>
  );
}
