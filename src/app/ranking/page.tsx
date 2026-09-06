import { redirect } from "next/navigation";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getLeaderboard } from "@/core/player/leaderboard-service";
import { Navbar } from "@/presentation/components/shared/navbar";

const medals = ["🥇", "🥈", "🥉"];

function Avatar({ name, photoURL }: { name: string; photoURL: string | null }) {
  return <span
    aria-hidden="true"
    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 bg-cover bg-center font-extrabold text-primary"
    style={photoURL ? { backgroundImage: `url(${photoURL})` } : undefined}
  >
    {!photoURL && name[0]?.toUpperCase()}
  </span>;
}

export default async function RankingPage() {
  const user = await getCurrentFirebaseUser();
  if (!user) redirect("/login");
  const { players, currentPlayer } = await getLeaderboard(user.uid);
  const number = new Intl.NumberFormat("pt-BR");

  return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <div className="inline-flex rounded-full bg-xp/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-xp-foreground">Liga geral</div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Ranking de jogadores 🏆</h1>
        <p className="font-bold text-muted-foreground">Ganhe XP resolvendo casos e suba de posição.</p>
      </div>

      {currentPlayer && <section className="card-pop border-primary/30 bg-primary/5 p-5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Sua posição</p>
        <div className="mt-2 flex items-center gap-3">
          <strong className="text-3xl">#{currentPlayer.position}</strong>
          <Avatar name={currentPlayer.displayName} photoURL={currentPlayer.photoURL} />
          <div className="min-w-0 flex-1"><p className="truncate font-extrabold">{currentPlayer.displayName}</p><p className="text-xs font-bold text-muted-foreground">Nível {currentPlayer.level} · 🔥 {currentPlayer.streak}</p></div>
          <strong className="text-xp-foreground">★ {number.format(currentPlayer.xp)} XP</strong>
        </div>
      </section>}

      <section className="card-pop overflow-hidden p-2">
        {players.length ? <div className="divide-y-2 divide-border">
          {players.map((player) => <div key={player.uid} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${player.isCurrentPlayer ? "bg-primary/10" : ""}`}>
            <span className="w-9 text-center text-lg font-extrabold">{medals[player.position - 1] ?? `#${player.position}`}</span>
            <Avatar name={player.displayName} photoURL={player.photoURL} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">{player.displayName}{player.isCurrentPlayer ? " (você)" : ""}</p>
              <p className="text-xs font-bold text-muted-foreground">Nível {player.level} · {player.casesPlayed} casos · {player.averageAccuracy}% de acerto</p>
            </div>
            <strong className="whitespace-nowrap text-sm text-xp-foreground">★ {number.format(player.xp)}</strong>
          </div>)}
        </div> : <p className="px-4 py-12 text-center font-bold text-muted-foreground">O ranking aparecerá quando os jogadores entrarem novamente na plataforma.</p>}
      </section>
    </main>
  </div>;
}
