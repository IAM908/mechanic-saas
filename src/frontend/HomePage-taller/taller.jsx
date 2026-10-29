import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'

const navigation = [

  { name: 'Resumen', icon: 'grid' },

  { name: 'Reparaciones', icon: 'activity' },

  { name: 'Órdenes de trabajo', icon: 'clipboard' },

  { name: 'Vehículos', icon: 'car' },

  { name: 'Clientes', icon: 'users' },

  { name: 'Mecánicos', icon: 'wrench' },

]



const repairs = [

  { id: 'OT-0248', vehicle: 'Toyota Corolla', plate: 'A912845', client: 'Carlos Méndez', contact: '8299272666', mechanic: 'Luis García', status: 'En proceso', progress: 65, color: 'blue' },

  { id: 'OT-0247', vehicle: 'Honda Civic', plate: 'A784321', client: 'María Pérez',  contact: '8299272666', mechanic: 'José Ramírez', status: 'Diagnóstico', progress: 25, color: 'amber' },

  { id: 'OT-0246', vehicle: 'Hyundai Tucson', plate: 'G562193', client: 'Andrés Díaz',  contact: '8299272666', mechanic: 'Luis García', status: 'Listo', progress: 100, color: 'emerald' },

  { id: 'OT-0245', vehicle: 'Kia Sportage', plate: 'A123765', client: 'Laura Santos',  contact: '8299272666', mechanic: 'Pedro Ruiz', status: 'En proceso', progress: 45, color: 'blue' },

]



const icons = {

  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,

  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,

  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></>,

  car: <><path d="m5 11 2-5h10l2 5M3 13l2-2h14l2 2v5H3z" /><path d="M6 18v2m12-2v2M6 14h2m8 0h2" /></>,

  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,

  wrench: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z" /></>,

  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,

  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,

  plus: <path d="M12 5v14m-7-7h14" />,

  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,

  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,

  check: <path d="m5 12 4 4L19 6" />,

  dollar: <><path d="M12 2v20m5-15H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6" /></>,

  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,

  chevron: <path d="m9 18 6-6-6-6" />,

}



function Icon({ name, size = 20, className = '' }) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.7"

      strokeLinecap="round"

      strokeLinejoin="round"

      className={className}

      aria-hidden="true"

    >

      {icons[name]}

    </svg>

  )

}



function Main() {

  const navigate = useNavigate();

  const [activePage, setActivePage] = useState('Resumen')

  const [isHovered, setIsHovered] = useState(false)

  const [mobileMenu, setMobileMenu] = useState(false)

  const [search, setSearch] = useState('')



  const filteredRepairs = repairs.filter((repair) =>

    `${repair.id} ${repair.vehicle} ${repair.plate} ${repair.client}`

      .toLowerCase()

      .includes(search.toLowerCase())

  )



  const stats = [

    { label: 'Vehículos en taller', value: '12', detail: '+2 respecto a ayer', icon: 'car', color: 'bg-blue-50 text-blue-700' },

    { label: 'Órdenes activas', value: '08', detail: '3 requieren atención', icon: 'clipboard', color: 'bg-amber-50 text-amber-700' },

    { label: 'Listos para entregar', value: '04', detail: 'Pendientes de recogida', icon: 'check', color: 'bg-emerald-50 text-emerald-700' },

    { label: 'Ingresos del mes', value: 'RD$ 84,500', detail: 'Facturación registrada', icon: 'dollar', color: 'bg-violet-50 text-violet-700' },

  ]



  const statusStyle = {

    'En proceso': 'bg-blue-50 text-blue-700',

    'Diagnóstico': 'bg-amber-50 text-amber-700',

    'Listo': 'bg-emerald-50 text-emerald-700',

  }



  const expanded = isHovered || mobileMenu



  return (

    <div className="min-h-screen bg-[#f7f8fa] text-[#20242c] md:flex w-screen">

      {mobileMenu && (

        <button

          aria-label="Cerrar menú"

          onClick={() => setMobileMenu(false)}

          className="fixed inset-0 z-40 bg-black/30 md:hidden"

        />

      )}



      <aside

        onMouseEnter={() => setIsHovered(true)}

        onMouseLeave={() => setIsHovered(false)}

        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#eaecf0] bg-white transition-all duration-300 md:sticky md:top-0 md:h-screen ${

          mobileMenu

            ? 'translate-x-0 w-[260px]'

            : '-translate-x-full w-[260px] md:translate-x-0'

        } ${!mobileMenu && !isHovered ? 'md:w-[76px]' : 'md:w-[260px]'}`}

      >

        <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-[#f0f1f4] px-5">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#20242c] text-white">

            <Icon name="wrench" size={22} />

          </div>

          <div className={`overflow-hidden whitespace-nowrap ${expanded ? 'block' : 'hidden'}`}>

            <h1 className="text-[17px] font-bold tracking-tight">Josefo</h1>

            <p className="text-[11px] text-gray-500">WORKSHOP MANAGEMENT</p>

          </div>

        </div>



        <div className="px-3 pt-7">

          <p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 ${expanded ? 'block' : 'hidden'}`}>

            Menú principal

          </p>



          <nav className="space-y-1">

            {navigation.map((item) => {

              const active = activePage === item.name



              return (

                <button

                  key={item.name}

                  onClick={() => {

                    setActivePage(item.name)

                    setMobileMenu(false)

                  }}

                  title={!expanded ? item.name : undefined}

                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition-colors ${

                    active

                      ? 'bg-[#20242c] text-white'

                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'

                  }`}

                >

                  <Icon name={item.icon} size={20} className="shrink-0" />

                  <span className={expanded ? 'block whitespace-nowrap' : 'hidden'}>

                    {item.name}

                  </span>

                  {active && expanded && (

                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />

                  )}

                </button>

              )

            })}

          </nav>

        </div>



        <div className="mt-auto p-3">

          <div className={`mb-3 rounded-xl bg-[#f7f8fa] p-3 ${expanded ? 'block' : 'hidden'}`}>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs font-semibold">Capacidad del taller</span>

              <span className="text-xs text-gray-500">60%</span>

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">

              <div className="h-full w-[60%] rounded-full bg-[#20242c]" />

            </div>

            <p className="mt-2 text-[11px] text-gray-500">12 de 20 espacios ocupados</p>

          </div>



          <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-gray-50">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eafc] text-xs font-bold text-indigo-700">

              JM

            </div>

            <div className={`${expanded ? 'block' : 'hidden'} min-w-0 flex-1`}>

              <p className="truncate text-xs font-semibold">José Martínez</p>

              <p className="text-[11px] text-gray-500">Administrador</p>

            </div>

            {expanded && <Icon name="chevron" size={16} className="text-gray-400" />}

          </button>

        </div>

      </aside>



      <div className="min-w-0 flex-1">

        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#eaecf0] bg-white/95 px-4 backdrop-blur-md sm:px-8">

          <div className="flex min-w-0 items-center gap-3">

            <button

              onClick={() => setMobileMenu(true)}

              className="rounded-lg p-2 hover:bg-gray-100 md:hidden"

              aria-label="Abrir menú"

            >

              <Icon name="menu" />

            </button>

            <div className="min-w-0">

              <p className="truncate text-[11px] text-gray-400">Taller / {activePage}</p>

              <h2 className="truncate text-lg font-semibold tracking-tight sm:text-xl">

                {activePage}

              </h2>

            </div>

          </div>



          <div className="flex items-center gap-2 sm:gap-4">

            <label className="hidden h-10 items-center gap-2 rounded-xl border border-[#eaecf0] px-3 sm:flex">

              <Icon name="search" size={17} className="text-gray-400" />

              <input

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder="Buscar vehículo..."

                className="w-36 bg-transparent text-xs outline-none placeholder:text-gray-400 lg:w-48"

              />

              <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400">/</kbd>

            </label>



            <button

              aria-label="Notificaciones"

              className="relative rounded-xl border border-[#eaecf0] p-2.5 text-gray-500 hover:bg-gray-50"

            >

              <Icon name="bell" size={18} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />

            </button>



            <button onClick={()=> navigate('/orden')} className="hidden items-center gap-2 rounded-xl bg-[#20242c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black sm:flex">

              <Icon name="plus" size={16} />

              Nueva orden

            </button>

          </div>

        </header>



        <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">

          <span className='fixed bottom-8 left-8'>



          <button className='p-4 text-2xl bg-blue-400 rounded-full'>

            +

          </button>

          </span>

          {activePage === 'Resumen' ? (

            <>

              <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>

                  <p className="mb-1 text-sm text-gray-500">Panel de control</p>

                  <h3 className="text-2xl font-semibold tracking-tight sm:text-[28px]">

                    Buenos días, José.

                  </h3>

       

                </div>

                <p className="text-xs font-medium text-gray-400 mt-18">

                  VISTA GENERAL · HOY

                </p>

              </section>



              <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => (

                  <article

                    key={stat.label}

                    className="rounded-2xl border border-[#eaecf0] bg-white p-5 transition-shadow hover:shadow-sm"

                  >

                    <div className="flex items-start justify-between">

                      <span className="text-[13px] font-medium text-gray-500">

                        {stat.label}

                      </span>

                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color}`}>

                        <Icon name={stat.icon} size={19} />

                      </span>

                    </div>

                    <p className="mt-5 text-[28px] font-semibold tracking-tight">

                      {stat.value}

                    </p>

                    <p className="mt-2 text-xs text-gray-400">{stat.detail}</p>

                  </article>

                ))}

              </section>



              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">

                <article className="min-w-0 overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">

                  <div className="flex flex-col justify-between gap-3 border-b border-[#f0f1f4] p-5 sm:flex-row sm:items-center sm:px-6">

                    <div>

                      <h3 className="font-semibold">Reparaciones recientes</h3>

                      <p className="mt-1 text-xs text-gray-400">

                        Seguimiento de los vehículos en el taller

                      </p>

                    </div>

                    <button

                      onClick={() => Navigate('/reparaciones')}

                      className="flex items-center gap-1 self-start text-xs font-semibold text-gray-600 hover:text-black sm:self-auto"

                    >

                      Ver todas <Icon name="chevron" size={15} />

                    </button>

                  </div>



                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[680px] text-left">

                      <thead>

                        <tr className="bg-[#fafbfc] text-[10px] font-semibold uppercase tracking-wider text-gray-400">

                          <th className="px-6 py-4">Vehículo</th>

                          <th className="px-4 py-4">Orden</th>

                          <th className="px-4 py-4">Mecánico</th>

                          <th className="px-4 py-4">Estado</th>

                          <th className="px-6 py-4">Progreso</th>

                          <th className="px-6 py-4">Contacto</th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-[#f0f1f4]">

                        {filteredRepairs.map((repair) => (

                          <tr key={repair.id} className="transition-colors hover:bg-gray-50/70">

                            <td className="px-6 py-4">

                              <div className="font-medium text-[13px]">{repair.vehicle}</div>

                              <div className="mt-1 text-[11px] text-gray-400">{repair.plate}</div>

                            </td>

                            <td className="px-4 py-4 text-xs font-medium text-gray-500">{repair.id}</td>

                            <td className="px-4 py-4 text-xs text-gray-600">{repair.mechanic}</td>

                            <td className="px-4 py-4">

                              <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle[repair.status]}`}>

                                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                {repair.status}

                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">

                                  <div

                                    className={`h-full rounded-full ${

                                      repair.color === 'emerald' ? 'bg-emerald-500' :

                                      repair.color === 'amber' ? 'bg-amber-400' : 'bg-blue-600'

                                    }`}

                                    style={{ width: `${repair.progress}%` }}

                                  />

                                </div>

                                <span className="text-[11px] text-gray-500">{repair.progress}%</span>

                              </div>

                            </td>

                            <td className="px-6 py-4">

                                <button className='p-4'>

                               

                                <a

  href={`https://wa.me/${repair.contact}?text=${encodeURIComponent(

    `Hola, escribo por la reparación ${repair.id} de tu ${repair.vehicle}.`

  )}`}

  target="_blank"

  rel="noopener noreferrer"

  className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"

>

  Contactar

</a>

                                </button>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                    {filteredRepairs.length === 0 && (

                      <p className="p-8 text-center text-sm text-gray-400">

                        No se encontraron reparaciones.

                      </p>

                    )}

                  </div>



                  <div className="border-t border-[#f0f1f4] px-6 py-4">

                    <p className="text-xs text-gray-400">

                      Mostrando {filteredRepairs.length} de {repairs.length} órdenes de ejemplo

                    </p>

                  </div>

                </article>



                <div className="space-y-5">

                  <article className="rounded-2xl border border-[#eaecf0] bg-white p-5">

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold">Estado del taller</h3>

                      <Icon name="activity" size={18} className="text-gray-400" />

                    </div>

                    <p className="mt-1 text-xs text-gray-400">Distribución de órdenes activas</p>



                    <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-gray-100">

                      <div className="w-[50%] bg-blue-600" />

                      <div className="w-[30%] bg-amber-400" />

                      <div className="w-[20%] bg-emerald-500" />

                    </div>



                    <div className="mt-5 space-y-4">

                      {[

                        { name: 'En proceso', count: 4, color: 'bg-blue-600' },

                        { name: 'Diagnóstico', count: 2, color: 'bg-amber-400' },

                        { name: 'Listos', count: 2, color: 'bg-emerald-500' },

                      ].map((item) => (

                        <div key={item.name} className="flex items-center justify-between">

                          <div className="flex items-center gap-2.5">

                            <span className={`h-2 w-2 rounded-full ${item.color}`} />

                            <span className="text-xs text-gray-600">{item.name}</span>

                          </div>

                          <span className="text-sm font-semibold">{item.count}</span>

                        </div>

                      ))}

                    </div>

                  </article>



                  <article className="rounded-2xl border border-[#eaecf0] bg-white p-5">

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold">Actividad reciente</h3>

                      <Icon name="clock" size={18} className="text-gray-400" />

                    </div>

                    <div className="mt-5 space-y-5">

                      <div className="flex gap-3">

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                          <Icon name="check" size={17} />

                        </span>

                        <div>

                          <p className="text-xs font-medium">Vehículo listo para entregar</p>

                          <p className="mt-1 text-[11px] text-gray-400">Hyundai Tucson · OT-0246</p>

                          <p className="mt-1 text-[10px] text-gray-300">Hace 15 minutos</p>

                        </div>

                      </div>

                      <div className="flex gap-3">

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                          <Icon name="wrench" size={17} />

                        </span>

                        <div>

                          <p className="text-xs font-medium">Reparación actualizada</p>

                          <p className="mt-1 text-[11px] text-gray-400">Toyota Corolla · OT-0248</p>

                          <p className="mt-1 text-[10px] text-gray-300">Hace 42 minutos</p>

                        </div>

                      </div>

                      <div className="flex gap-3">

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                          <Icon name="clipboard" size={17} />

                        </span>

                        <div>

                          <p className="text-xs font-medium">Nueva orden registrada</p>

                          <p className="mt-1 text-[11px] text-gray-400">Kia Sportage · OT-0245</p>

                          <p className="mt-1 text-[10px] text-gray-300">Hace 1 hora</p>

                        </div>

                      </div>

                    </div>

                  </article>

                </div>

              </section>



              <footer className="flex flex-col justify-between gap-2 pb-2 text-[11px] text-gray-400 sm:flex-row">

                <span>Josefo Workshop · Gestión inteligente del taller</span>

                <span>Panel de administración</span>

              </footer>

            </>

          ) : (

            <section className="rounded-2xl border border-[#eaecf0] bg-white p-8 sm:p-12">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">

                <Icon name={navigation.find((item) => item.name === activePage)?.icon || 'grid'} size={24} />

              </div>

              <h3 className="mt-5 text-xl font-semibold">{activePage}</h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">

                Esta sección está preparada para conectar la gestión de {activePage.toLowerCase()} con tu API y tu base de datos.

              </p>

              <button

                onClick={() => setActivePage('Resumen')}

                className="mt-6 rounded-xl bg-[#20242c] px-4 py-3 text-xs font-semibold text-white hover:bg-black"

              >

                Volver al resumen

              </button>

            </section>

          )}

        </main>

      </div>

    </div>

  )

}



export default Main

