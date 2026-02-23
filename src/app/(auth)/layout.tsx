import { Dumbbell, BookOpen, Trophy, Users } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Hero — hidden on mobile */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#3DA100] via-[#58CC02] to-[#78E62A] p-12 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute top-1/3 -right-8 h-40 w-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10 mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            GYM<span className="text-white/80">STUDY</span>
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 text-center mb-12">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Transforme seus estudos<br />em conquistas
          </h1>
          <p className="text-white/80 text-lg max-w-sm">
            Estude, evolua e compartilhe seu progresso com uma comunidade de desenvolvedores.
          </p>
        </div>

        {/* Stats mock */}
        <div className="relative z-10 grid grid-cols-3 gap-6 w-full max-w-sm">
          <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-white/80" />
            <p className="text-2xl font-bold">1.2k</p>
            <p className="text-xs text-white/70">Membros</p>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-white/80" />
            <p className="text-2xl font-bold">48k</p>
            <p className="text-xs text-white/70">Horas estudadas</p>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-white/80" />
            <p className="text-2xl font-bold">892</p>
            <p className="text-xs text-white/70">Badges</p>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold text-primary">
            GYM<span className="text-foreground">STUDY</span>
          </span>
        </div>

        {/* Form content */}
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
