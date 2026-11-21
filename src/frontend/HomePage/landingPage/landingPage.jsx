
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LandingPage = () => {
  const mainRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      })

      gsap.from('.hero-preview', {
        x: 60,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
      })

      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 45, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

      gsap.utils.toArray('[data-stagger]').forEach((container) => {
        gsap.fromTo(
          container.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-[#fafafa] text-zinc-900"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">mechanic<span className="text-indigo-600">.</span></span>
        </a>

        <div className="hidden items-center gap-9 text-sm font-medium text-zinc-500 md:flex">
          <a href="#features" className="transition hover:text-indigo-600">Funcionalidades</a>
          <a href="#how-it-works" className="transition hover:text-indigo-600">Cómo funciona</a>
          <a href="#benefits" className="transition hover:text-indigo-600">Beneficios</a>
        </div>

        <div className="flex items-center gap-3">
          <a href="/login" className="hidden text-sm font-semibold text-zinc-700 transition hover:text-indigo-600 sm:block">
            Iniciar sesión
          </a>
          <a href="/register" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
            Comenzar ahora
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="hero-content">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Gestión inteligente para talleres
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Tu taller, más organizado. <span className="text-indigo-600">Tus clientes, mejor informados.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-500">
              Administra vehículos, clientes y órdenes de trabajo desde un solo lugar. Mantén a tus clientes informados sobre cada reparación sin llamadas ni mensajes innecesarios.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="/register" className="rounded-xl bg-indigo-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                Empieza a gestionar tu taller →
              </a>
              <a href="#features" className="rounded-xl border border-zinc-200 bg-white px-7 py-4 text-sm font-semibold text-zinc-700 transition hover:border-indigo-200 hover:text-indigo-600">
                Conocer más
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-zinc-500">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-xs font-bold text-indigo-700">T</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-xs font-bold text-emerald-700">M</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-100 text-xs font-bold text-amber-700">C</div>
              </div>
              <span>Todo lo que necesitas para gestionar tu taller.</span>
            </div>
          </div>

          {/* DASHBOARD */}
          <div className="relative hero-preview">
            <div className="absolute -inset-5 rounded-[2rem] bg-indigo-200/40 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-indigo-900/10">
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                <div>
                  <p className="text-sm font-bold">Panel de control</p>
                  <p className="mt-1 text-xs text-zinc-400">Resumen de tu taller</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" strokeWidth="1.8">
                    <path d="M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-5">
                {[
                  { label: 'Vehículos', value: '12', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'En proceso', value: '08', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Finalizados', value: '04', color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-zinc-100 p-3 sm:p-4">
                    <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                      <span className="text-sm font-bold">↗</span>
                    </div>
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="mt-1 text-[10px] text-zinc-400 sm:text-xs">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold">Órdenes recientes</p>
                  <span className="text-xs font-semibold text-indigo-600">Ver todas</span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Toyota Corolla 2022', plate: 'A123456', status: 'En reparación', color: 'bg-amber-50 text-amber-700' },
                    { name: 'Honda Civic 2021', plate: 'B456789', status: 'En diagnóstico', color: 'bg-blue-50 text-blue-700' },
                    { name: 'Hyundai Tucson 2023', plate: 'C789123', status: 'Finalizado', color: 'bg-emerald-50 text-emerald-700' }
                  ].map((vehicle) => (
                    <div key={vehicle.plate} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" strokeWidth="1.8">
                            <path d="m5 11 1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14l1 2v5h-2v-2H6v2H4v-5l1-2Zm2 0h10" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="7.5" cy="14" r="1" />
                            <circle cx="16.5" cy="14" r="1" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold sm:text-sm">{vehicle.name}</p>
                          <p className="mt-1 text-[10px] text-zinc-400">{vehicle.plate}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold sm:text-[10px] ${vehicle.color}`}>
                        {vehicle.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-5 py-4">
                <span className="text-xs text-zinc-400">Actualizado recientemente</span>
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Sistema activo
                </span>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-7 hidden rounded-2xl border border-zinc-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">✓</div>
                <div>
                  <p className="text-xs font-bold">Trabajo actualizado</p>
                  <p className="mt-1 text-[10px] text-zinc-400">Cliente informado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-y border-zinc-100 bg-white px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Funcionalidades</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Todo tu taller conectado en un solo lugar.</h2>
            <p className="mt-5 leading-7 text-zinc-500">Menos tareas manuales, más control sobre cada reparación y una mejor experiencia para tus clientes.</p>
          </div>

          <div data-stagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '01',
                title: 'Órdenes de trabajo',
                description: 'Registra reparaciones, asigna mecánicos y consulta el progreso de cada vehículo.'
              },
              {
                icon: '02',
                title: 'Gestión de vehículos',
                description: 'Mantén organizados los vehículos, sus propietarios y su historial de servicios.'
              },
              {
                icon: '03',
                title: 'Seguimiento para clientes',
                description: 'Permite que tus clientes consulten el estado de sus reparaciones desde su propio portal.'
              },
              {
                icon: '04',
                title: 'Administración de equipo',
                description: 'Organiza los miembros de tu taller y gestiona sus responsabilidades.'
              },
              {
                icon: '05',
                title: 'Información centralizada',
                description: 'Consulta los datos de clientes, vehículos y trabajos desde una misma plataforma.'
              },
              {
                icon: '06',
                title: 'Acceso seguro',
                description: 'Gestiona los permisos de acceso según los roles y responsabilidades de cada usuario.'
              }
            ].map((feature) => (
              <article key={feature.title} className="group rounded-2xl border border-zinc-100 bg-[#fafafa] p-7 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  {feature.icon}
                </span>
                <h3 className="mt-6 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-500">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <div data-reveal>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Proceso sencillo</span>
              <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-tight sm:text-4xl">Cada reparación, bajo control.</h2>
              <p className="mt-5 leading-7 text-zinc-500">Desde que un vehículo llega al taller hasta que está listo para entregarse, mantén toda la información organizada.</p>
            </div>

            <div data-stagger className="mt-10 space-y-8">
              {[
                ['01', 'Registra el vehículo', 'Añade los datos del cliente y su vehículo para crear una orden de trabajo.'],
                ['02', 'Gestiona la reparación', 'Asigna un mecánico, registra las actividades y actualiza el estado del trabajo.'],
                ['03', 'Mantén informado al cliente', 'Permite que el propietario consulte el progreso de su vehículo desde su portal.']
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-sm font-bold text-indigo-600">{number}</span>
                  <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal className="rounded-3xl bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-600/20 sm:p-12">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">Portal del cliente</span>
              <span className="text-sm text-indigo-200">#ORD-00124</span>
            </div>
            <h3 className="mt-10 text-2xl font-bold">Toyota Corolla 2022</h3>
            <p className="mt-2 text-sm text-indigo-200">Orden de reparación · A123456</p>

            <div className="mt-10 rounded-2xl bg-white p-6 text-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Estado de reparación</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">En proceso</span>
              </div>

              <div className="mt-8 space-y-7">
                {[
                  ['Vehículo recibido', 'El taller ha registrado tu vehículo.', true],
                  ['Diagnóstico', 'Se ha completado la revisión inicial.', true],
                  ['En reparación', 'El mecánico está trabajando en tu vehículo.', true],
                  ['Listo para entregar', 'Pendiente de finalizar el trabajo.', false]
                ].map(([title, description, done], index) => (
                  <div key={title} className="relative flex gap-4">
                    {index !== 3 && <div className={`absolute left-[11px] top-7 h-10 w-px ${done ? 'bg-indigo-200' : 'bg-zinc-200'}`} />}
                    <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${done ? 'bg-indigo-600 text-white' : 'border-2 border-zinc-200 bg-white text-zinc-400'}`}>
                      {done ? '✓' : index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-indigo-200">Una experiencia más transparente para tus clientes.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="benefits" className="bg-white px-6 py-24 lg:px-10">
        <div data-reveal className="mx-auto max-w-5xl rounded-3xl bg-zinc-950 px-8 py-16 text-center text-white sm:px-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Da el siguiente paso</span>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Dedica menos tiempo a organizar y más tiempo a trabajar.</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-zinc-400">Centraliza la operación de tu taller y ofrece a tus clientes una forma más clara de conocer el estado de sus vehículos.</p>
          <a href="/register" className="mt-9 inline-flex rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Comenzar ahora →
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <a href="#" className="text-xl font-bold tracking-tight">mechanic<span className="text-indigo-600">.</span></a>
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} Mechanic. Gestión inteligente para talleres automotrices.</p>
          <a href="/login" className="text-sm font-medium text-zinc-500 transition hover:text-indigo-600">Acceder a mi cuenta</a>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
