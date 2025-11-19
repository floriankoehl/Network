export default function GithubStats() {
  return (
    <div className="bg-black/40 border h-full border-white/10 rounded-2xl p-6 text-white max-w-xl">
      <h2 className="text-2xl font-semibold mb-4">GitHub activity</h2>

      <div className="flex flex-col gap-4 items-center">
        {/* Main stats card */}
        <img
          src="https://github-readme-stats.vercel.app/api?username=floriankoehl&show_icons=true&theme=transparent&hide_border=true"
          alt="GitHub stats for floriankoehl"
          className="max-w-full"
        />

        {/* Top languages card (optional) */}
        <img
          src="https://github-readme-stats.vercel.app/api/top-langs/?username=floriankoehl&layout=compact&theme=transparent&hide_border=true"
          alt="Top languages for floriankoehl"
          className="max-w-full"
        />
      </div>
    </div>
  );
}
