import React, { useState } from 'react'

const vehicles = [
  {
    id: 1,
    order: 'OT-0248',
    name: 'Toyota Corolla',
    plate: 'A912845',
    year: 2022,
    status: 'in_progress',
    description: 'Mantenimiento general y revisión de frenos',
    update: 'El equipo está realizando el mantenimiento y la revisión de frenos.',
    updatedAt: 'Hoy, 11:42 a. m.',
    entryAt: 'Hoy, 9:24 a. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Toyota&model=Corolla'
  },
  {
    id: 2,
    order: 'OT-0247',
    name: 'Honda Civic',
    plate: 'B784321',
    year: 2020,
    status: 'pending',
    description: 'Inspección general de fluidos y frenos',
    update: 'El vehículo está pendiente de revisión.',
    updatedAt: 'Ayer, 4:15 p. m.',
    entryAt: 'Ayer, 3:30 p. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Honda&model=Civic'
  },
  {
    id: 3,
    order: 'OT-0239',
    name: 'Mazda CX-5',
    plate: 'C732190',
    year: 2021,
    status: 'completed',
    description: 'Cambio de pastillas y balanceo',
    update: 'Servicio concluido exitosamente.',
    updatedAt: '22 Oct, 5:00 p. m.',
    entryAt: '21 Oct, 8:15 a. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Mazda&model=CX-5'
  }
]

const statusMap = {
  pending: {
    label: 'Pendiente',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    dot: 'border-amber-500',
    step: 0
  },
  in_progress: {
    label: 'En reparación',
    badge: 'bg-[#eff4fe] text-[#2c6ecb] border border-[#d6e3fb]',
    dot: 'border-[#2c6ecb]',
    step: 1
  },
  completed: {
    label: 'Completado',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    dot: 'border-emerald-500',
    step: 2
  },
  cancelled: {
    label: 'Cancelada',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    dot: 'border-rose-500',
    step: -1
  }
}

const stages = [
  { name: 'Recibido', sub: 'Hoy, 9:24 a. m.' },
  { name: 'En reparación', sub: 'En proceso' },
  { name: 'Finalizado', sub: 'Pendiente' }
]

function Icon({ name, size = 18, className = '' }) {
  const paths = {
    home: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    car: (
      <>
        <path d="M5 11l2-5h10l2 5" />
        <path d="M3 13l2-2h14l2 2v5H3z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </>
    ),
    history: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    bell: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
    cross: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    headset: (
      <>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </>
    ),
    arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
    wrench: (
      <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z" />
    ),
    tag: (
      <>
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <circle cx="7" cy="7" r=".5" fill="currentColor" />
      </>
    ),
    chevronUpDown: <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />,
    brandToyota: (
      <>
        <ellipse cx="12" cy="12" rx="10" ry="7" />
        <ellipse cx="12" cy="10" rx="4.5" ry="3.2" />
        <path d="M12 6.8v10.4" />
      </>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function StatusBadge({ status }) {
  const item = statusMap[status] || statusMap.pending

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${item.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full border-[1.5px] ${item.dot} bg-transparent`} />
      {item.label}
    </span>
  )
}

function CustomerUI() {
  const [page, setPage] = useState('Inicio')
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id)

  const selectedVehicle = vehicles.find(v => v.id === selectedId) || vehicles[0]
  const historyVehicles = vehicles.filter(v => ['completed', 'cancelled'].includes(v.status))

  const navItems = [
    { label: 'Inicio', icon: 'home' },
    { label: 'Mis vehículos', icon: 'car' },
    { label: 'Historial', icon: 'history' }
  ]

  const currentStep = statusMap[selectedVehicle.status]?.step ?? 0

  return (
    <div className="flex min-h-screen bg-[#fcfcfd] text-[#111] font-sans antialiased selection:bg-neutral-900 selection:text-white">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between border-r border-[#ededed] bg-white p-5">
        <div className="space-y-8">
          <div className="px-2 pt-1">
            <span className="text-2xl font-bold tracking-tight text-[#111]">
              Josefo<span className="text-[#888]">.</span>
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const active = page === item.label
              return (
                <button
                  key={item.label}
                  onClick={() => setPage(item.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-[#f4f4f5] text-[#111]'
                      : 'text-[#666] hover:bg-[#fafafa] hover:text-[#111]'
                  }`}
                >
                  <Icon name={item.icon} size={16} className={active ? 'text-[#111]' : 'text-[#888]'} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[#f7f7f8] p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ebebeb] text-[11px] font-bold text-[#555]">
              JM
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold leading-tight text-[#111]">José Martínez</p>
              <p className="text-[11px] text-[#888]">Cliente</p>
            </div>
          </div>
          <Icon name="chevronUpDown" size={14} className="text-[#888]" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-end border-b border-[#ededed] bg-white px-8">
          <div className="flex items-center gap-3">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#666] hover:bg-[#f5f5f5] transition">
              <Icon name="bell" size={17} />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ebebeb] text-[10px] font-bold text-[#555]">
              JM
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl p-8 space-y-8">
          {page === 'Inicio' && (
            <>
             


              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_260px] items-start">
                <div className="space-y-6">
                  <div className="relative overflow-hidden rounded-3xl bg-[#131518] p-7 text-white shadow-xl shadow-black/5">
                    <div className="flex items-start justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-[#1c2438] px-2.5 py-1 text-[11px] font-medium text-blue-300">
                        <span className="h-1.5 w-1.5 rounded-full border border-blue-400 bg-transparent" />
                        {statusMap[selectedVehicle.status]?.label}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-white/50">
                        <Icon name="brandToyota" size={24} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-4">
                      <div>
                        <p className="text-xs font-medium text-neutral-400">Orden #{selectedVehicle.order}</p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{selectedVehicle.name}</h2>
                        <p className="mt-1 text-xs text-neutral-400">
                          {selectedVehicle.plate} • {selectedVehicle.year}
                        </p>

                        <div className="mt-5 flex items-start gap-2 text-neutral-300">
                          <Icon name="wrench" size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                          <p className="text-xs leading-relaxed text-neutral-300 max-w-xs">{selectedVehicle.description}</p>
                        </div>

                        <button
                          onClick={() => setPage('Mis vehículos')}
                          className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                        >
                          Ver detalles del vehículo
                          <Icon name="arrowRight" size={13} />
                        </button>
                      </div>

                      <div className="flex justify-center items-center">
                        <img
                          src={selectedVehicle.image}
                          alt={selectedVehicle.name}
                          className="max-h-44 w-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#ededed] bg-white p-6 shadow-sm">
                    <h3 className="text-xs font-bold tracking-tight text-[#111]">Estado de la reparación</h3>

                    <div className="mt-8 px-6">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-[#ededed] -z-0" />
                        <div
                          className="absolute left-6 top-3.5 h-[2px] bg-[#2c6ecb] -z-0 transition-all duration-300"
                          style={{
                            width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : 'calc(100% - 3rem)'
                          }}
                        />

                        {stages.map((stage, idx) => {
                          const isCompleted = currentStep > idx
                          const isCurrent = currentStep === idx

                          return (
                            <div key={stage.name} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition ${
                                  isCompleted
                                    ? 'bg-[#111] text-white'
                                    : isCurrent
                                    ? 'bg-[#2c6ecb] text-white ring-4 ring-[#e7efff]'
                                    : 'border border-[#ddd] bg-white text-[#aaa]'
                                }`}
                              >
                                {isCompleted ? (
                                  <Icon name="check" size={13} />
                                ) : isCurrent ? (
                                  <Icon name="cross" size={11} className="rotate-45" />
                                ) : (
                                  <Icon name="cross" size={11} />
                                )}
                              </div>
                              <p className="mt-2.5 text-xs font-bold text-[#111]">{stage.name}</p>
                              <p className="mt-0.5 text-[11px] text-[#888]">{stage.sub}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl bg-[#fafafc] p-4 border border-[#f0f0f2]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111]">
                        <Icon name="clock" size={14} className="text-[#666]" />
                        Última actualización
                      </div>
                      <div className="mt-3 flex items-start gap-3 rounded-xl bg-white p-3.5 border border-[#ededed]">
                        <Icon name="clock" size={15} className="mt-0.5 shrink-0 text-[#888]" />
                        <div>
                          <p className="text-xs text-[#444] leading-relaxed">{selectedVehicle.update}</p>
                          <p className="mt-1 text-[11px] text-[#888]">{selectedVehicle.updatedAt}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-[#ededed] bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#111]">Tu próximo paso</p>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#666]">
                        <Icon name="calendar" size={16} />
                      </div>
                      <p className="text-xs text-[#666] leading-relaxed">
                        Te notificaremos cuando esté listo para recoger.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#ededed] bg-white p-5 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#111]">
                      <Icon name="headset" size={15} />
                    </div>
                    <p className="mt-3 text-xs font-bold text-[#111]">¿Necesitas ayuda?</p>
                    <p className="mt-0.5 text-xs text-[#888]">Estamos aquí para asistirte.</p>
                    <button className="mt-4 w-full rounded-xl bg-[#111] py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition">
                      Contactar al taller
                    </button>
                  </div>

                  <div className="rounded-3xl border border-[#ededed] bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#111]">Resumen</p>
                    <div className="mt-4 space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#666]">
                          <Icon name="car" size={13} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888]">Vehículo</p>
                          <p className="text-xs font-bold text-[#111]">{selectedVehicle.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#666]">
                          <Icon name="tag" size={13} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888]">Placa</p>
                          <p className="text-xs font-bold text-[#111]">{selectedVehicle.plate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#666]">
                          <Icon name="calendar" size={13} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888]">Orden</p>
                          <p className="text-xs font-bold text-[#111]">{selectedVehicle.order}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#666]">
                          <Icon name="clock" size={13} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888]">Ingreso</p>
                          <p className="text-xs font-bold text-[#111]">{selectedVehicle.entryAt}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111]">Tus vehículos</h3>
                    <p className="text-xs text-[#888]">Consulta el estado de todos tus vehículos registrados.</p>
                  </div>
                  <button
                    onClick={() => setPage('Mis vehículos')}
                    className="flex items-center gap-1 text-xs font-bold text-[#666] hover:text-[#111] transition"
                  >
                    Ver todos
                    <Icon name="arrowRight" size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map(vehicle => {
                    const isCardSelected = vehicle.id === selectedId
                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => setSelectedId(vehicle.id)}
                        className={`group cursor-pointer rounded-2xl border bg-white p-4 transition hover:shadow-md ${
                          isCardSelected ? 'shadow-sm' : 'border-[#ededed] hover:border-[#ccc]'
                        }`}
                      >
                        <div className="flex h-32 items-center justify-center rounded-xl bg-[#f8f8fa] p-2">
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="max-h-24 w-full object-contain transition group-hover:scale-105"
                          />
                        </div>

                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-[#111]">{vehicle.name}</h4>
                          <p className="text-[11px] text-[#888]">
                            {vehicle.plate} • {vehicle.year}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <StatusBadge status={vehicle.status} />
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f4f5] text-[#666] group-hover:bg-[#111] group-hover:text-white transition">
                            <Icon name="arrowRight" size={11} />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {page === 'Mis vehículos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#111]">Mis vehículos</h1>
                <p className="mt-1 text-xs text-[#888]">
                  Gestión integral de los vehículos registrados a tu nombre.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map(vehicle => (
                  <div
                    key={vehicle.id}
                    className="overflow-hidden rounded-3xl border border-[#ededed] bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-36 items-center justify-center rounded-2xl bg-[#f8f8fa] p-4">
                      <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="mt-4">
                      <StatusBadge status={vehicle.status} />
                      <h3 className="mt-2.5 text-sm font-bold text-[#111]">{vehicle.name}</h3>
                      <p className="text-xs text-[#888]">
                        {vehicle.plate} • {vehicle.year}
                      </p>
                      <div className="my-3.5 border-t border-[#f0f0f2]" />
                      <p className="text-[11px] font-bold text-[#888]">Orden #{vehicle.order}</p>
                      <p className="mt-0.5 text-xs text-[#555] line-clamp-2">{vehicle.description}</p>
                      <button
                        onClick={() => {
                          setSelectedId(vehicle.id)
                          setPage('Inicio')
                        }}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#111] py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
                      >
                        Ver seguimiento
                        <Icon name="arrowRight" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'Historial' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#111]">Historial de reparaciones</h1>
                <p className="mt-1 text-xs text-[#888]">
                  Consulta de órdenes de servicio finalizadas o canceladas.
                </p>
              </div>

              <div className="space-y-3">
                {historyVehicles.length > 0 ? (
                  historyVehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[#ededed] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-[#f8f8fa] p-2">
                        <img src={vehicle.image} alt={vehicle.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#111]">{vehicle.name}</h3>
                          <span className="text-xs text-[#888]">• Orden #{vehicle.order}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#666]">{vehicle.description}</p>
                        <p className="mt-2 text-[11px] text-[#888]">Concluido: {vehicle.updatedAt}</p>
                      </div>
                      <StatusBadge status={vehicle.status} />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#ededed] bg-white p-12 text-center text-xs text-[#888]">
                    No hay registros históricos disponibles.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default CustomerUI