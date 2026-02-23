import Link from 'next/link';
import {
  Dumbbell,
  Flame,
  Star,
  Trophy,
  Users,
  BookOpen,
  Target,
  Medal,
  Zap,
  ArrowRight,
  Check,
  BarChart3,
  Swords,
  Shield,
  Globe,
} from 'lucide-react';

/* ─────────────────── Data ─────────────────── */

const FEATURES = [
  {
    icon: Flame,
    color: '#FF9600',
    bg: '#FFF0E0',
    title: 'Ofensivas de Estudo',
    desc: 'Mantenha sua sequência diária e proteja com Streak Freezes quando precisar falhar sem perder tudo.',
  },
  {
    icon: Star,
    color: '#FFC800',
    bg: '#FFFAE0',
    title: 'XP e Sistema de Níveis',
    desc: 'Cada sessão, post e conquista gera XP. Suba de nível, acumule histórico e mostre sua evolução.',
  },
  {
    icon: Swords,
    color: '#58CC02',
    bg: '#E8F9E0',
    title: 'Ligas Semanais',
    desc: 'Compita em ligas de Bronze a Diamante contra 30 pessoas. Suba, caia, repita. Toda semana.',
  },
  {
    icon: Medal,
    color: '#CE82FF',
    bg: '#F5E8FF',
    title: 'Badges Verificados',
    desc: 'Avaliações técnicas em JS, TS, React, Node e Python. Badges verificados no seu perfil público.',
  },
  {
    icon: Users,
    color: '#1CB0F6',
    bg: '#E0F4FF',
    title: 'Feed da Comunidade',
    desc: 'Compartilhe sessões e conquistas. Curta, comente, reaja e endosse habilidades de colegas.',
  },
  {
    icon: Target,
    color: '#FF4B4B',
    bg: '#FFE8E8',
    title: 'Missões Diárias',
    desc: 'Missões renovam todo dia. Complete-as para ganhar XP bônus e acelerar sua progressão.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Crie sua conta',
    desc: 'Registro em 30 segundos com email ou Google. Grátis para sempre.',
    color: '#58CC02',
    bg: '#E8F9E0',
    border: '#58CC02',
  },
  {
    num: '02',
    title: 'Estude e registre',
    desc: 'Use o timer integrado. Cada sessão gera XP, avança missões e atualiza sua ofensiva.',
    color: '#FFC800',
    bg: '#FFFAE0',
    border: '#FFC800',
  },
  {
    num: '03',
    title: 'Suba na classificação',
    desc: 'Acumule XP, suba de liga, desbloqueie badges e apareça no ranking global.',
    color: '#CE82FF',
    bg: '#F5E8FF',
    border: '#CE82FF',
  },
];

const LEAGUE_ROWS = [
  { pos: 1, name: 'Ana Lima', xp: 1840, av: 'AL', color: '#58CC02' },
  { pos: 2, name: 'Carlos M.', xp: 1620, av: 'CM', color: '#1CB0F6' },
  { pos: 3, name: 'Ana S.', xp: 1240, av: 'AS', color: '#FF9600', me: true },
  { pos: 4, name: 'Julia F.', xp: 980, av: 'JF', color: '#CE82FF' },
  { pos: 5, name: 'Pedro S.', xp: 860, av: 'PS', color: '#FF4B4B' },
];

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

/* ─────────────────── Page ─────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav
        className="sticky top-0 z-50 flex h-16 items-center border-b-2 border-[#E5E7EB] bg-white/95 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#58CC02]"
              style={{ boxShadow: '0 3px 0 #58A700' }}
            >
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span style={{ color: '#58CC02' }}>GYM</span>
              <span style={{ color: '#1A1A1A' }}>STUDY</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {(['Recursos', 'Como funciona', 'Ligas'] as const).map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-semibold text-[#666] hover:text-[#1A1A1A] no-underline transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="no-underline hidden sm:block">
              <span className="text-sm font-bold text-[#666] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                Entrar
              </span>
            </Link>
            <Link href="/register" className="no-underline">
              <button
                className="px-5 py-2.5 rounded-xl bg-[#58CC02] text-white text-sm font-extrabold transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                style={{ boxShadow: '0 4px 0 #58A700' }}
              >
                Começar grátis
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden bg-white pb-28 pt-20 lg:pt-28">
        {/* Background glow blobs */}
        <div
          className="pointer-events-none absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(88,204,2,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -left-32 top-1/2 h-[400px] w-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(28,176,246,0.07) 0%, transparent 70%)' }}
        />

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* ── Left: Copy ── */}
            <div className="space-y-8">
              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest"
                style={{
                  background: '#E8F9E0',
                  border: '2px solid rgba(88,204,2,0.3)',
                  color: '#58CC02',
                }}
              >
                <span>✦</span>
                Plataforma de estudos gamificada
              </div>

              {/* Headline */}
              <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-[#1A1A1A] lg:text-6xl">
                Estude mais.{' '}
                <br />
                <span
                  style={{
                    backgroundImage: 'linear-gradient(120deg, #58CC02 0%, #1CB0F6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Evolua rápido.
                </span>
                <br />
                Domine.
              </h1>

              {/* Subheadline */}
              <p className="max-w-md text-lg leading-relaxed text-[#555]">
                Transforme suas sessões de estudo em conquistas reais com XP, ligas
                competitivas, badges verificados e uma comunidade de devs que
                se motivam juntos.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="no-underline">
                  <button
                    className="flex items-center gap-2 rounded-xl bg-[#58CC02] px-8 py-4 text-base font-extrabold text-white transition-all hover:brightness-105 active:translate-y-1 active:shadow-none"
                    style={{ boxShadow: '0 5px 0 #58A700' }}
                  >
                    Começar grátis
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/login" className="no-underline">
                  <button
                    className="flex items-center gap-2 rounded-xl border-2 bg-white px-8 py-4 text-base font-bold text-[#333] transition-all hover:border-[#58CC02]/50 hover:bg-[#E8F9E0]"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    Já tenho conta
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {[
                    { l: 'A', c: '#58CC02' },
                    { l: 'W', c: '#1CB0F6' },
                    { l: 'M', c: '#FF9600' },
                    { l: 'J', c: '#CE82FF' },
                    { l: '+', c: '#1A1A1A' },
                  ].map(({ l, c }, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white"
                      style={{ backgroundColor: c, zIndex: 5 - i }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#666]">
                  <span className="font-extrabold text-[#1A1A1A]">1.200+</span>{' '}
                  desenvolvedores já evoluindo
                </p>
              </div>
            </div>

            {/* ── Right: App Preview ── */}
            <div className="relative hidden items-center justify-center lg:flex">

              {/* Floating chip: Streak */}
              <div
                className="absolute -left-6 top-0 z-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5"
                style={{
                  transform: 'rotate(-4deg)',
                  border: '2px solid rgba(255,150,0,0.25)',
                  boxShadow: '0 4px 0 #E5E7EB, 0 8px 24px rgba(0,0,0,0.10)',
                }}
              >
                <Flame className="h-6 w-6" style={{ color: '#FF9600', fill: '#FF9600' }} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#999' }}>Ofensiva</p>
                  <p className="text-xl font-black leading-none" style={{ color: '#FF9600' }}>47 dias</p>
                </div>
              </div>

              {/* Floating chip: Liga */}
              <div
                className="absolute right-0 top-4 z-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5"
                style={{
                  transform: 'rotate(3deg)',
                  border: '2px solid rgba(255,200,0,0.25)',
                  boxShadow: '0 4px 0 #E5E7EB, 0 8px 24px rgba(0,0,0,0.10)',
                }}
              >
                <Trophy className="h-5 w-5" style={{ color: '#FFC800' }} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#999' }}>Liga</p>
                  <p className="text-sm font-black leading-none text-[#1A1A1A]">Diamante · #3</p>
                </div>
              </div>

              {/* Main card — app preview */}
              <div
                className="w-[340px] overflow-hidden rounded-3xl bg-white"
                style={{
                  border: '2.5px solid #E5E7EB',
                  boxShadow: '0 8px 0 #E0E0E0, 0 24px 60px rgba(0,0,0,0.14)',
                }}
              >
                {/* Card header: green gradient */}
                <div
                  className="p-5 text-white"
                  style={{ background: 'linear-gradient(135deg, #3DA100 0%, #58CC02 60%, #78E62A 100%)' }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-sm font-black">
                      AS
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-medium">Bom dia,</p>
                      <p className="text-lg font-extrabold leading-none">Ana!</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                      <Star className="h-3 w-3" style={{ fill: '#FFC800', color: '#FFC800' }} />
                      <span className="text-xs font-black">Nv. 12</span>
                    </div>
                  </div>
                  {/* XP bar */}
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-white/80">
                      <span className="font-semibold">2.340 XP</span>
                      <span>420 XP para nível 13</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: '68%',
                          background: '#FFC800',
                          boxShadow: '0 0 10px rgba(255,200,0,0.7)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div
                  className="grid grid-cols-3 divide-x-2 border-b-2 border-[#F4F4F4] divide-[#F4F4F4]"
                >
                  {[
                    { Icon: Flame, val: '47', sub: 'dias', c: '#FF9600', bg: '#FFF0E0' },
                    { Icon: Zap, val: '840', sub: 'XP semana', c: '#FFC800', bg: '#FFFAE0' },
                    { Icon: Check, val: '3/3', sub: 'missões', c: '#58CC02', bg: '#E8F9E0' },
                  ].map(({ Icon, val, sub, c, bg }) => (
                    <div key={sub} className="flex flex-col items-center py-3">
                      <div
                        className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl"
                        style={{ backgroundColor: bg }}
                      >
                        <Icon className="h-4 w-4" style={{ color: c }} />
                      </div>
                      <p className="text-base font-black leading-none" style={{ color: c }}>{val}</p>
                      <p className="mt-0.5 text-[10px]" style={{ color: '#AAA' }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Daily quests */}
                <div className="space-y-2.5 p-4">
                  <p
                    className="text-[10px] font-extrabold uppercase tracking-widest"
                    style={{ color: '#BBB' }}
                  >
                    ⚡ Missões de hoje
                  </p>
                  {[
                    { title: 'Estudar 30 minutos', xp: 20, done: true },
                    { title: 'Publicar no feed', xp: 40, done: true },
                    { title: 'Ganhar 50 XP', xp: 20, done: false, pct: 60 },
                  ].map((q) => (
                    <div key={q.title} className="flex items-center gap-2.5">
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                        style={{
                          borderColor: q.done ? '#58CC02' : '#E0E0E0',
                          backgroundColor: q.done ? '#58CC02' : 'transparent',
                        }}
                      >
                        {q.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#333]">{q.title}</p>
                        {!q.done && (
                          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-[#F0F0F0]">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(q as any).pct}%`, backgroundColor: '#FFC800' }}
                            />
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] font-bold" style={{ color: '#FFC800' }}>
                        +{q.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating chip: XP gain */}
              <div
                className="absolute -bottom-4 -right-4 z-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5"
                style={{
                  transform: 'rotate(2.5deg)',
                  border: '2px solid rgba(206,130,255,0.25)',
                  boxShadow: '0 4px 0 #E5E7EB, 0 8px 24px rgba(0,0,0,0.10)',
                }}
              >
                <Star className="h-5 w-5" style={{ color: '#FFC800', fill: '#FFC800' }} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#999' }}>XP ganho hoje</p>
                  <p className="text-sm font-black leading-none" style={{ color: '#CE82FF' }}>+120 XP 🎉</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section style={{ background: '#111' }} className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              { val: '1.200+', label: 'Desenvolvedores', Icon: Users, c: '#58CC02' },
              { val: '48k+', label: 'Horas estudadas', Icon: BookOpen, c: '#FFC800' },
              { val: '892+', label: 'Badges emitidos', Icon: Medal, c: '#CE82FF' },
              { val: '15k+', label: 'Sessões registradas', Icon: BarChart3, c: '#1CB0F6' },
            ].map(({ val, label, Icon, c }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div
                  className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: c + '20' }}
                >
                  <Icon className="h-5 w-5" style={{ color: c }} />
                </div>
                <p className="text-3xl font-black text-white">{val}</p>
                <p className="mt-0.5 text-sm font-medium" style={{ color: '#888' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="Recursos" className="bg-[#F7F7F7] py-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="mb-16 text-center">
            <p
              className="mb-3 text-xs font-extrabold uppercase tracking-widest"
              style={{ color: '#58CC02' }}
            >
              Recursos
            </p>
            <h2 className="text-4xl font-black text-[#1A1A1A]">
              Tudo que você precisa para{' '}
              <span style={{ color: '#58CC02' }}>evoluir de verdade</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#666]">
              Uma plataforma completa que transforma disciplina em progresso
              mensurável — e divertido.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-white p-6 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
                style={{
                  border: '2px solid #E5E7EB',
                  boxShadow: '0 2px 0 #E5E7EB',
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <h3 className="mb-2 text-base font-extrabold text-[#1A1A1A]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#666]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="Como-funciona" className="bg-white py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p
              className="mb-3 text-xs font-extrabold uppercase tracking-widest"
              style={{ color: '#1CB0F6' }}
            >
              Como funciona
            </p>
            <h2 className="text-4xl font-black text-[#1A1A1A]">
              Em 3 passos você está dentro
            </h2>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Connecting dashes (desktop) */}
            <div
              className="absolute hidden md:block"
              style={{
                top: '3rem',
                left: 'calc(16.5% + 3rem)',
                right: 'calc(16.5% + 3rem)',
                height: '3px',
                background:
                  'linear-gradient(to right, #58CC02 0%, #FFC800 50%, #CE82FF 100%)',
                borderRadius: '999px',
              }}
            />

            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                {/* Circle */}
                <div
                  className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-3xl font-black"
                  style={{
                    backgroundColor: step.bg,
                    color: step.color,
                    boxShadow: `0 0 0 4px ${step.color}35, 0 6px 20px rgba(0,0,0,0.10)`,
                  }}
                >
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-extrabold text-[#1A1A1A]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#666]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ LEAGUES SHOWCASE ═══════════════════ */}
      <section id="Ligas" className="overflow-hidden bg-[#F7F7F7] py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Left: copy */}
            <div>
              <p
                className="mb-3 text-xs font-extrabold uppercase tracking-widest"
                style={{ color: '#CE82FF' }}
              >
                Ligas Competitivas
              </p>
              <h2 className="mb-6 text-4xl font-black text-[#1A1A1A]">
                Compete toda semana.{' '}
                <span style={{ color: '#CE82FF' }}>Suba de divisão.</span>
              </h2>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-[#666]">
                Cada semana você compete contra 30 estudantes da sua liga. Os
                melhores sobem, os últimos podem rebaixar. Adrenalina real com
                motivação real.
              </p>
              <div className="space-y-4">
                {[
                  { e: '🥇', t: 'Top 3 sobe de liga a cada semana', c: '#FFC800' },
                  { e: '🏆', t: '10 divisões de Bronze a Diamante', c: '#58CC02' },
                  { e: '❄️', t: 'Streak Freezes protegem sua ofensiva', c: '#1CB0F6' },
                  { e: '⚡', t: 'Ranking atualizado em tempo real', c: '#CE82FF' },
                ].map(({ e, t, c }) => (
                  <div key={t} className="flex items-center gap-3">
                    <span className="text-xl">{e}</span>
                    <p className="text-sm font-semibold text-[#333]">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: League preview card */}
            <div
              className="overflow-hidden rounded-3xl bg-white"
              style={{
                border: '2.5px solid #E5E7EB',
                boxShadow: '0 6px 0 #E0E0E0, 0 24px 60px rgba(0,0,0,0.12)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2.5 border-b-2 p-5"
                style={{
                  borderColor: '#F0F0F0',
                  background:
                    'linear-gradient(135deg, rgba(206,130,255,0.15) 0%, rgba(28,176,246,0.10) 100%)',
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(206,130,255,0.15)' }}
                >
                  <Trophy className="h-5 w-5" style={{ color: '#CE82FF' }} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#1A1A1A]">Liga Diamante</p>
                  <p className="text-xs text-[#999]">Semana 8 · 5 dias restantes</p>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-1.5 p-4">
                {LEAGUE_ROWS.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                    style={{
                      backgroundColor: p.me ? '#E8F9E0' : 'transparent',
                      border: p.me ? '2px solid #58CC02' : '2px solid transparent',
                    }}
                  >
                    <span
                      className="w-6 text-center text-sm font-black"
                      style={{ color: p.pos <= 3 ? '#FFC800' : '#CCC' }}
                    >
                      {p.pos <= 3 ? MEDAL_ICONS[p.pos - 1] : p.pos}
                    </span>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.av}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1A1A1A]">
                        {p.name}
                        {p.me && (
                          <span
                            className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                            style={{ background: '#58CC02', color: 'white' }}
                          >
                            Você
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" style={{ color: '#FFC800' }} />
                      <span className="text-sm font-black" style={{ color: '#FFC800' }}>
                        {p.xp.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="mt-3 border-t-2 border-dashed border-[#F0F0F0] pt-2 text-center">
                  <p className="text-[11px]" style={{ color: '#BBB' }}>
                    Zona de rebaixamento a partir do #6
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BADGES STRIP ═══════════════════ */}
      <section className="border-y-2 border-[#E5E7EB] bg-white py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-extrabold text-[#1A1A1A]">
              Badges verificados que valem seu currículo
            </h3>
            <p className="mt-2 text-sm text-[#777]">
              Conclua avaliações técnicas e mostre que você realmente sabe o que diz.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'JavaScript', color: '#F7DF1E', bg: '#FDFAE0', text: '#333' },
              { label: 'TypeScript', color: '#3178C6', bg: '#E0EEFF', text: '#fff' },
              { label: 'React', color: '#61DAFB', bg: '#E0FAFE', text: '#333' },
              { label: 'Node.js', color: '#68A063', bg: '#E0F0DC', text: '#fff' },
              { label: 'Python', color: '#3776AB', bg: '#E0EEFF', text: '#fff' },
              { label: 'SQL', color: '#FF9600', bg: '#FFF0E0', text: '#fff' },
            ].map(({ label, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-extrabold text-sm"
                style={{ borderColor: color + '50', backgroundColor: bg, color: '#333' }}
              >
                <Shield className="h-4 w-4" style={{ color }} />
                {label}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white"
                  style={{ background: color }}
                >
                  Verificado
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA FINAL ═══════════════════ */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div
            className="relative overflow-hidden rounded-3xl p-14 text-white"
            style={{
              background: 'linear-gradient(135deg, #2D8000 0%, #58CC02 45%, #78E62A 100%)',
            }}
          >
            {/* Decorative orbs */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
              style={{ background: 'rgba(255,255,255,0.10)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div
              className="pointer-events-none absolute right-1/3 top-8 h-20 w-20 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />

            <div className="relative z-10">
              {/* Badge */}
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.20)' }}
              >
                <Globe className="h-3.5 w-3.5" />
                100% gratuito para começar
              </div>

              <h2 className="mb-4 text-4xl font-black leading-tight lg:text-5xl">
                Pronto para dominar<br />seus estudos?
              </h2>
              <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-white/80">
                Junte-se a mais de 1.200 desenvolvedores que transformaram
                disciplina em resultados reais e conquistas verificadas.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="no-underline">
                  <button
                    className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-extrabold text-[#58CC02] transition-all hover:scale-[1.02] active:scale-100"
                    style={{ boxShadow: '0 5px 0 rgba(0,0,0,0.15)' }}
                  >
                    Criar conta grátis
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/login" className="no-underline">
                  <button
                    className="flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10"
                  >
                    Fazer login
                  </button>
                </Link>
              </div>

              {/* Inline proof */}
              <p className="mt-8 text-sm text-white/60">
                Sem cartão de crédito · Sem limite de tempo · Upgrade quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer
        className="border-t-2 bg-white py-10"
        style={{ borderColor: '#E5E7EB' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#58CC02]"
                style={{ boxShadow: '0 2px 0 #58A700' }}
              >
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-[#1A1A1A]">
                <span style={{ color: '#58CC02' }}>GYM</span>STUDY
              </span>
            </div>

            <p className="text-sm" style={{ color: '#999' }}>
              © 2024 GymStudy. Feito com{' '}
              <span style={{ color: '#FF9600' }}>🔥</span> para devs que não
              param de aprender.
            </p>

            <div className="flex gap-6">
              <Link href="/login" className="text-sm font-semibold text-[#666] hover:text-[#1A1A1A] no-underline transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm font-semibold text-[#666] hover:text-[#1A1A1A] no-underline transition-colors">
                Registrar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
