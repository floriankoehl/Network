// src/components/GithubHeatmapIcon.jsx

export default function GithubHeatmapIcon({ username = "floriankoehl" }) {
  const src = `https://github-contributions-api.deno.dev/${username}.svg`;

  return (
    <div className="w-full inline-flex items-center justify-center rounded-xl bg-black/40 border border-white/20 rounded-2xl">
      <div className=" h-40 overflow-hidden flex items-center justify-end">
        <img
          src={src}
          alt={`GitHub contributions for ${username}`}
          className="h-full w-auto"
        />
      </div>
    </div>
  );
}
