// orgarhythmus/projects/components/OrgaProjects.jsx
import { useEffect, useState } from "react";
import { fetch_all_projects, create_project_api } from "../../org_API";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Plus, Folder, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function OrgaProjects() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    async function loadProjects() {
        try {
            setLoading(true);
            const data = await fetch_all_projects();
            setProjects(data || []);
        } catch (err) {
            console.error(err);
            setError("Projekte konnten nicht geladen werden.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Bitte gib deinem Projekt einen Namen.");
            return;
        }

        try {
            setFormSubmitting(true);
            const newProject = await create_project_api(name.trim(), description.trim());

            // Neu an Liste anhängen
            setProjects((prev) => [newProject, ...prev]);

            // Formular zurücksetzen
            setName("");
            setDescription("");
        } catch (err) {
            console.error(err);
            setError(err.message || "Projekt konnte nicht erstellt werden.");
        } finally {
            setFormSubmitting(false);
        }
    }

    const hasProjects = projects && projects.length > 0;

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-slate-50 to-slate-100 flex justify-center">
            <div className="w-full max-w-5xl px-4 py-8 flex flex-col gap-6">
                {/* Header */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <Folder size={18} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                                Projekte
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Lege neue Projekte an und sammle deine OrgaRhythmus-Boards.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Create form card */}
                <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm p-4 sm:p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                                Neues Projekt
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Name und optional eine kurze Beschreibung – mehr brauchst du noch nicht.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-1">
                        <TextField
                            label="Projektname"
                            size="small"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <TextField
                            label="Beschreibung (optional)"
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        {error && (
                            <p className="text-xs text-red-500 mt-1">{error}</p>
                        )}

                        <div className="mt-1 flex justify-end">
                            <Button
                                type="submit"
                                variant="contained"
                                size="small"
                                disabled={formSubmitting || !name.trim()}
                                style={{
                                    textTransform: "none",
                                    borderRadius: "9999px",
                                    paddingInline: "1.1rem",
                                    display: "flex",
                                    gap: "0.35rem",
                                    alignItems: "center",
                                }}
                            >
                                <Plus size={16} />
                                {formSubmitting ? "Wird erstellt..." : "Projekt erstellen"}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Projects list */}
                <section className="rounded-2xl border border-slate-200 bg-white/75 backdrop-blur-sm shadow-sm p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                            Deine Projekte
                        </h2>
                        <span className="text-xs text-slate-400">
                            {hasProjects
                                ? `${projects.length} Projekt${projects.length === 1 ? "" : "e"}`
                                : loading
                                    ? "Lade..."
                                    : "Noch keine Projekte"}
                        </span>
                    </div>

                    {loading ? (
                        <p className="text-sm text-slate-500">Projekte werden geladen...</p>
                    ) : hasProjects ? (
                        <div className="flex flex-col divide-y divide-slate-100">
                            {projects.map((p) => (
                                <div
                                    key={p.id}
                                    className="py-3 flex items-start justify-between gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {p.name}
                                        </p>
                                        {p.description && (
                                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                                {p.description}
                                            </p>
                                        )}
                                        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <User size={11} />
                                                <span>{p.owner_username}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={11} />
                                                <span>
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate(`/orgarhythmus/projects/${p.id}`)}
                                        style={{
                                            textTransform: "none",
                                            borderRadius: "9999px",
                                            fontSize: "11px",
                                            paddingInline: "0.9rem",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Öffnen
                                    </Button>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-slate-500">
                            <p>Noch keine Projekte angelegt.</p>
                            <p className="mt-1">
                                Nutze oben <span className="font-semibold">„Neues Projekt“</span>,
                                um dein erstes OrgaRhythmus-Projekt zu starten ✨
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
