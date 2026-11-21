import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'mechanic_saas_orders_v1'

export const SESSION_STATUS_META = {
  pending: {
    label: 'Pendiente',
    badge: 'bg-zinc-100 text-zinc-700 ring-zinc-500/15',
    dot: 'bg-zinc-400',
    stepIndex: 0,
    description: 'Orden recibida en recepción, pendiente de inicio por el mecánico.'
  },
  assigned: {
    label: 'Asignado',
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    dot: 'bg-blue-500',
    stepIndex: 1,
    description: 'Mecánico asignado y listo para iniciar diagnóstico.'
  },
  in_progress: {
    label: 'En reparación',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
    dot: 'bg-indigo-600',
    stepIndex: 2,
    description: 'El mecánico está ejecutando el diagnóstico y reparación.'
  },
  paused: {
    label: 'En pausa',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    dot: 'bg-amber-500',
    stepIndex: 2,
    isInterruption: true,
    description: 'Trabajo temporalmente pausado por el mecánico.'
  },
  waiting_parts: {
    label: 'Esperando piezas',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    dot: 'bg-amber-500',
    stepIndex: 2,
    isInterruption: true,
    description: 'Estamos esperando las piezas necesarias para continuar.'
  },
  waiting_approval: {
    label: 'Esperando autorización',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    dot: 'bg-amber-500',
    stepIndex: 2,
    isInterruption: true,
    description: 'Se requiere aprobación de presupuesto para continuar.'
  },
  review: {
    label: 'En revisión',
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/15',
    dot: 'bg-violet-500',
    stepIndex: 3,
    description: 'Pruebas finales del mecánico antes de marcar como completado.'
  },
  completed: {
    label: 'Completado',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    dot: 'bg-emerald-500',
    stepIndex: 4,
    description: 'Reparación finalizada por el mecánico y vehículo listo para entrega.'
  },
  cancelled: {
    label: 'Cancelada',
    badge: 'bg-red-50 text-red-700 ring-red-600/15',
    dot: 'bg-red-500',
    stepIndex: -1,
    description: 'La orden fue cancelada.'
  }
}

export const ALLOWED_TRANSITIONS = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'waiting_parts', 'waiting_approval', 'review', 'cancelled'],
  paused: ['in_progress', 'cancelled'],
  waiting_parts: ['in_progress', 'cancelled'],
  waiting_approval: ['in_progress', 'cancelled'],
  review: ['in_progress', 'completed'],
  completed: [],
  cancelled: []
}

const PROPOSAL_STATUS_META = {
  pending_admin: {
    label: 'Por confirmar (Admin)',
    style: 'bg-amber-50 text-amber-700 ring-amber-600/15'
  },
  pending_client: {
    label: 'Enviado al cliente',
    style: 'bg-blue-50 text-blue-700 ring-blue-600/15'
  },
  approved_client: {
    label: 'Aprobado por cliente',
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
  },
  rejected: {
    label: 'Descartado',
    style: 'bg-red-50 text-red-700 ring-red-600/15'
  }
}

const initialMembers = [
  { id: 1, name: 'José Martínez', email: 'recepcion@josefoworkshop.com', role: 'admin', is_active: true },
  { id: 2, name: 'Luis García', email: 'luis.garcia@josefoworkshop.com', role: 'mechanic', is_active: true },
  { id: 3, name: 'José Ramírez', email: 'jose.ramirez@josefoworkshop.com', role: 'mechanic', is_active: true },
  { id: 4, name: 'Pedro Ruiz', email: 'pedro.ruiz@josefoworkshop.com', role: 'mechanic', is_active: true }
]

export const initialDemoOrders = [
  {
    id: 'OT-0248',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    vehicle: 'Toyota Corolla',
    plate: 'A912845',
    client: 'Carlos Méndez',
    contact: '8299272666',
    email: 'carlos.mendez@email.com',
    mechanic: 'Luis García',
    status: 'in_progress',
    description: 'Cliente reporta ruido al frenar y solicita mantenimiento general.',
    diagnosis: 'Desgaste severo en pastillas delanteras y discos con alabeo.',
    initialBudget: 15000,
    initialBudgetStatus: 'approved',
    createdAt: 'Hoy, 9:24 a. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Toyota&model=Corolla',
    proposals: [
      {
        id: 'PR-101',
        title: 'Juego de pastillas cerámicas delanteras',
        description: 'Sustitución de pastillas desgastadas por juego original cerámico.',
        reason: 'Las pastillas actuales están al límite de seguridad (2mm).',
        amount: 2500,
        status: 'approved_client',
        createdBy: 'Luis García',
        createdAt: 'Hoy, 10:15 a. m.'
      },
      {
        id: 'PR-102',
        title: 'Rectificación de discos delanteros',
        description: 'Torneado de ambos discos delanteros para eliminar vibración al frenar.',
        reason: 'Superficie irregular detectada durante el desmontaje.',
        amount: 1800,
        status: 'pending_client',
        createdBy: 'Luis García',
        createdAt: 'Hoy, 11:10 a. m.'
      },
      {
        id: 'PR-103',
        title: 'Reemplazo de sensor ABS derecho',
        description: 'Cableado del sensor sulfatado.',
        reason: 'Provoca alerta intermitente en el tablero.',
        amount: 3200,
        status: 'pending_admin',
        createdBy: 'Luis García',
        createdAt: 'Hoy, 11:40 a. m.'
      }
    ],
    payments: [
      { id: 'PAY-1', amount: 10000, method: 'Transferencia', date: 'Hoy, 9:30 a. m.' }
    ],
    history: [
      { id: 'H-1', text: 'Recepción ingresó el vehículo y lo asignó a Luis García.', time: 'Hoy, 9:24 a. m.' },
      { id: 'H-2', text: 'Mecánico Luis García fijó diagnóstico y mano de obra base en RD$ 15,000.', time: 'Hoy, 9:40 a. m.' },
      { id: 'H-3', text: 'Cliente aprobó: Juego de pastillas cerámicas (RD$ 2,500).', time: 'Hoy, 10:45 a. m.' }
    ]
  },
  {
    id: 'OT-0247',
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    vehicle: 'Honda Civic',
    plate: 'A784321',
    client: 'María Pérez',
    contact: '8095551290',
    email: 'maria.perez@email.com',
    mechanic: 'José Ramírez',
    status: 'waiting_approval',
    description: 'Fallo de encendido en frío y vibración en marcha mínima.',
    diagnosis: 'Bobina del cilindro #3 defectuosa y bujías desgastadas.',
    initialBudget: 4500,
    initialBudgetStatus: 'approved',
    createdAt: 'Hoy, 8:15 a. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Honda&model=Civic',
    proposals: [
      {
        id: 'PR-104',
        title: 'Bobina de encendido OEM #3',
        description: 'Reemplazo de bobina dañada.',
        reason: 'Pérdida de chispa en cilindro 3.',
        amount: 4200,
        status: 'pending_admin',
        createdBy: 'José Ramírez',
        createdAt: 'Hoy, 10:00 a. m.'
      }
    ],
    payments: [],
    history: [
      { id: 'H-4', text: 'Orden recibida en recepción.', time: 'Hoy, 8:15 a. m.' },
      { id: 'H-5', text: 'Mecánico José Ramírez cambió el estado a Esperando autorización.', time: 'Hoy, 10:05 a. m.' }
    ]
  },
  {
    id: 'OT-0246',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2022,
    vehicle: 'Hyundai Tucson',
    plate: 'G562193',
    client: 'Andrés Díaz',
    contact: '8492219988',
    email: 'andres.diaz@email.com',
    mechanic: 'Luis García',
    status: 'review',
    description: 'Mantenimiento preventivo de transmisión automática.',
    diagnosis: 'Cambio de fluido ATF y empaque completado sin fugas.',
    initialBudget: 12000,
    initialBudgetStatus: 'approved',
    createdAt: 'Ayer, 2:10 p. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Hyundai&model=Tucson',
    proposals: [
      {
        id: 'PR-105',
        title: 'Filtro interno de transmisión',
        description: 'Sustitución de filtro saturado.',
        reason: 'Recomendado al bajar el cárter de transmisión.',
        amount: 3500,
        status: 'approved_client',
        createdBy: 'Luis García',
        createdAt: 'Ayer, 4:00 p. m.'
      }
    ],
    payments: [
      { id: 'PAY-2', amount: 12000, method: 'Tarjeta', date: 'Ayer, 2:15 p. m.' }
    ],
    history: [
      { id: 'H-6', text: 'Mecánico Luis García pasó el vehículo a Revisión de calidad.', time: 'Hoy, 8:50 a. m.' }
    ]
  },
  {
    id: 'OT-0245',
    brand: 'Kia',
    model: 'Sportage',
    year: 2021,
    vehicle: 'Kia Sportage',
    plate: 'A123765',
    client: 'Laura Santos',
    contact: '8298813344',
    email: 'laura.santos@email.com',
    mechanic: 'Pedro Ruiz',
    status: 'waiting_parts',
    description: 'Aire acondicionado no enfría.',
    diagnosis: 'Compresor averiado; esperando llegada del repuesto.',
    initialBudget: 8500,
    initialBudgetStatus: 'approved',
    createdAt: 'Ayer, 10:00 a. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Kia&model=Sportage',
    proposals: [
      {
        id: 'PR-106',
        title: 'Compresor A/C + carga de gas R134a',
        description: 'Instalación de compresor nuevo y vacío del sistema.',
        reason: 'Compresor actual trancado internamente.',
        amount: 14500,
        status: 'approved_client',
        createdBy: 'Pedro Ruiz',
        createdAt: 'Ayer, 11:30 a. m.'
      }
    ],
    payments: [
      { id: 'PAY-3', amount: 15000, method: 'Efectivo', date: 'Ayer, 12:10 p. m.' }
    ],
    history: [
      { id: 'H-7', text: 'Mecánico Pedro Ruiz reportó espera de compresor A/C.', time: 'Ayer, 3:00 p. m.' }
    ]
  },
  {
    id: 'OT-0244',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2021,
    vehicle: 'Mazda CX-5',
    plate: 'C732190',
    client: 'Carlos Méndez',
    contact: '8299272666',
    email: 'carlos.mendez@email.com',
    mechanic: 'Pedro Ruiz',
    status: 'completed',
    description: 'Alineación, balanceo y rotación de neumáticos.',
    diagnosis: 'Servicio completado según especificaciones.',
    initialBudget: 6500,
    initialBudgetStatus: 'approved',
    createdAt: '22 Oct, 8:15 a. m.',
    image: 'https://carapi.trustcar.info/getImage?make=Mazda&model=CX-5',
    proposals: [],
    payments: [
      { id: 'PAY-4', amount: 6500, method: 'Efectivo', date: '22 Oct, 4:50 p. m.' }
    ],
    history: [
      { id: 'H-8', text: 'Mecánico Pedro Ruiz completó la reparación.', time: '22 Oct, 5:00 p. m.' }
    ]
  }
]

export function computeOrderFinancials(order) {
  const initialApproved = order.initialBudgetStatus === 'pending_admin' ? 0 : Number(order.initialBudget || 0)
  const initialRaw = Number(order.initialBudget || 0)
  const approvedExtras = (order.proposals || [])
    .filter((p) => p.status === 'approved_client')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const pendingAdminAmount = (order.proposals || [])
    .filter((p) => p.status === 'pending_admin')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const pendingClientAmount = (order.proposals || [])
    .filter((p) => p.status === 'pending_client')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const paid = (order.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const totalAuthorized = initialApproved + approvedExtras
  const balance = Math.max(0, totalAuthorized - paid)

  return {
    initial: initialApproved,
    initialRaw,
    approvedExtras,
    pendingAdminAmount,
    pendingClientAmount,
    totalAuthorized,
    paid,
    balance
  }
}

export function formatRD(amount) {
  return `RD$ ${Number(amount || 0).toLocaleString('es-DO')}`
}

const navigation = [
  { name: 'Resumen', shortName: 'Inicio', icon: 'grid' },
  { name: 'Órdenes de trabajo', shortName: 'Órdenes', icon: 'clipboard' },
  { name: 'Presupuestos', shortName: 'Cotizaciones', icon: 'dollar' },
  { name: 'Reparaciones', shortName: 'Taller', icon: 'activity' },
  { name: 'Vehículos', shortName: 'Vehículos', icon: 'car' },
  { name: 'Clientes', shortName: 'Clientes', icon: 'users' },
  { name: 'Mecánicos', shortName: 'Equipo', icon: 'wrench' }
]

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></>,
  car: <><path d="m5 11 2-5h10l2 5M3 13l2-2h14l2 2v5H3z" /><path d="M6 18v2m12-2v2M6 14h2m8 0h2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  wrench: <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  dollar: <><path d="M12 2v20m5-15H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>
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

function StatusBadge({ status }) {
  const meta = SESSION_STATUS_META[status] || SESSION_STATUS_META.pending
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

function ProposalBadge({ status }) {
  const meta = PROPOSAL_STATUS_META[status] || PROPOSAL_STATUS_META.pending_admin
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${meta.style}`}>
      {meta.label}
    </span>
  )
}

const STEPPER_LABELS = [
  'Recibida',
  'Asignada',
  'En proceso',
  'Revisión',
  'Completada'
]

function RepairStageStepper({ status }) {
  const meta = SESSION_STATUS_META[status] || SESSION_STATUS_META.pending
  if (status === 'cancelled') {
    return <span className="text-[11px] font-medium text-red-600">Sesión cancelada</span>
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {STEPPER_LABELS.map((label, idx) => {
          const done = meta.stepIndex > idx || status === 'completed'
          const current = meta.stepIndex === idx && status !== 'completed'
          return (
            <span
              key={label}
              title={label}
              className={`h-1.5 w-5 rounded-full transition-all ${
                done
                  ? 'bg-emerald-500'
                  : current
                  ? meta.isInterruption
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                  : 'bg-zinc-200'
              }`}
            />
          )
        })}
      </div>
      <span className="text-[10px] text-zinc-400">
        Etapa {Math.max(1, meta.stepIndex + 1)} de 5 · {STEPPER_LABELS[Math.max(0, meta.stepIndex)]}
      </span>
    </div>
  )
}

function Main() {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialDemoOrders
    } catch {
      return initialDemoOrders
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch (e) {
      console.error(e)
    }
  }, [orders])

  useEffect(() => {
    const syncAcrossTabs = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue))
        } catch {}
      }
    }
    window.addEventListener('storage', syncAcrossTabs)
    return () => window.removeEventListener('storage', syncAcrossTabs)
  }, [])

  const [activePage, setActivePage] = useState('Resumen')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [mechanicFilter, setMechanicFilter] = useState('Todos')
  const [proposalFilter, setProposalFilter] = useState('Todos')

  const [mobileMenu, setMobileMenu] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const [currentUser, setCurrentUser] = useState(initialMembers[0])
  const [mechanicScope, setMechanicScope] = useState('assigned')

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [detailTab, setDetailTab] = useState('operativo')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState(null)

  const [proposalDraft, setProposalDraft] = useState({
    title: '',
    description: '',
    reason: '',
    amount: ''
  })
  const [confirmProposalModal, setConfirmProposalModal] = useState(false)
  const [paymentDraft, setPaymentDraft] = useState({ amount: '', method: 'Transferencia' })
  const [noteDraft, setNoteDraft] = useState('')
  const [baseBudgetDraft, setBaseBudgetDraft] = useState('')

  const [newOrder, setNewOrder] = useState({
    brand: '',
    model: '',
    year: '2022',
    plate: '',
    client: '',
    contact: '',
    mechanic: 'Luis García',
    description: ''
  })

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  const mechanicsList = useMemo(
    () => initialMembers.filter((m) => m.role === 'mechanic').map((m) => m.name),
    []
  )

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  )

  const canExecuteTechnicalWork = (order) => {
    if (!order) return false
    return currentUser.role === 'mechanic' && order.mechanic === currentUser.name
  }

  const isAdmin = currentUser.role === 'admin'

  const allProposals = useMemo(() => {
    const list = []
    orders.forEach((order) => {
      ;(order.proposals || []).forEach((prop) => {
        list.push({
          ...prop,
          orderId: order.id,
          vehicle: `${order.brand} ${order.model}`,
          plate: order.plate,
          client: order.client,
          mechanic: order.mechanic
        })
      })
    })
    return list
  }, [orders])

  const pendingAdminProposals = useMemo(
    () => allProposals.filter((p) => p.status === 'pending_admin'),
    [allProposals]
  )

  const pendingClientProposals = useMemo(
    () => allProposals.filter((p) => p.status === 'pending_client'),
    [allProposals]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (currentUser.role === 'mechanic' && mechanicScope === 'assigned') {
        if (order.mechanic !== currentUser.name) return false
      }
      if (mechanicFilter !== 'Todos' && order.mechanic !== mechanicFilter) {
        return false
      }
      if (statusFilter !== 'Todos' && order.status !== statusFilter) {
        return false
      }
      const query = search.trim().toLowerCase()
      if (!query) return true
      return [
        order.id,
        order.vehicle,
        order.brand,
        order.model,
        order.plate,
        order.client,
        order.mechanic
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [orders, currentUser, mechanicScope, mechanicFilter, statusFilter, search])

  const activeOrders = useMemo(
    () => orders.filter((o) => !['completed', 'cancelled'].includes(o.status)),
    [orders]
  )

  const dashboardStats = useMemo(() => {
    if (currentUser.role === 'mechanic') {
      const myOrders = orders.filter((o) => o.mechanic === currentUser.name)
      return [
        {
          label: 'Mis asignadas',
          value: myOrders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length,
          detail: 'Responsabilidad técnica',
          icon: 'wrench',
          color: 'bg-blue-50 text-blue-700'
        },
        {
          label: 'En reparación',
          value: myOrders.filter((o) => o.status === 'in_progress').length,
          detail: 'En ejecución activa',
          icon: 'activity',
          color: 'bg-indigo-50 text-indigo-700'
        },
        {
          label: 'En espera',
          value: myOrders.filter((o) => ['waiting_parts', 'waiting_approval'].includes(o.status)).length,
          detail: 'Piezas o autorización',
          icon: 'alert',
          color: 'bg-amber-50 text-amber-700'
        },
        {
          label: 'En revisión',
          value: myOrders.filter((o) => o.status === 'review').length,
          detail: 'Listas para cierre',
          icon: 'check',
          color: 'bg-emerald-50 text-emerald-700'
        }
      ]
    }

    const totalAuthorizedAll = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + computeOrderFinancials(o).totalAuthorized, 0)

    return [
      {
        label: 'En taller',
        value: activeOrders.length,
        detail: 'Vehículos activos',
        icon: 'car',
        color: 'bg-blue-50 text-blue-700'
      },
      {
        label: 'Por confirmar',
        value: pendingAdminProposals.length,
        detail: 'Cotizaciones de mecánicos',
        icon: 'clipboard',
        color: 'bg-amber-50 text-amber-700'
      },
      {
        label: 'En cliente',
        value: pendingClientProposals.length,
        detail: 'Esperando respuesta',
        icon: 'clock',
        color: 'bg-indigo-50 text-indigo-700'
      },
      {
        label: 'Autorizado',
        value: formatRD(totalAuthorizedAll),
        detail: 'Aprobado por clientes',
        icon: 'dollar',
        color: 'bg-emerald-50 text-emerald-700'
      }
    ]
  }, [orders, currentUser, activeOrders.length, pendingAdminProposals.length, pendingClientProposals.length])

  const handleStatusTransition = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        if (!canExecuteTechnicalWork(order)) return order

        const allowed = ALLOWED_TRANSITIONS[order.status] || []
        if (!allowed.includes(nextStatus)) return order

        const statusLabel = SESSION_STATUS_META[nextStatus]?.label || nextStatus
        return {
          ...order,
          status: nextStatus,
          history: [
            {
              id: `H-${Date.now()}`,
              text: `Mecánico ${currentUser.name} actualizó el estado del vehículo a "${statusLabel}".`,
              time: 'Justo ahora'
            },
            ...(order.history || [])
          ]
        }
      })
    )
    notify('Estado técnico actualizado.')
  }

  const handleMechanicSetBaseBudget = (e) => {
    e.preventDefault()
    if (!selectedOrder || !canExecuteTechnicalWork(selectedOrder)) return
    const amountNum = Number(baseBudgetDraft)
    if (!amountNum || amountNum <= 0) return

    setOrders((prev) =>
      prev.map((order) =>
        order.id !== selectedOrder.id
          ? order
          : {
              ...order,
              initialBudget: amountNum,
              initialBudgetStatus: 'pending_admin',
              history: [
                {
                  id: `H-${Date.now()}`,
                  text: `Mecánico ${currentUser.name} estableció el presupuesto base en ${formatRD(amountNum)} (Pendiente confirmación Admin).`,
                  time: 'Justo ahora'
                },
                ...(order.history || [])
              ]
            }
      )
    )
    setBaseBudgetDraft('')
    notify('Presupuesto base registrado. Administración debe confirmar su envío.')
  }

  const handleAdminConfirmBaseBudget = (orderId) => {
    if (!isAdmin) return
    setOrders((prev) =>
      prev.map((order) =>
        order.id !== orderId
          ? order
          : {
              ...order,
              initialBudgetStatus: 'approved',
              history: [
                {
                  id: `H-${Date.now()}`,
                  text: `Administración (${currentUser.name}) confirmó y publicó el presupuesto base de ${formatRD(order.initialBudget)} al cliente.`,
                  time: 'Justo ahora'
                },
                ...(order.history || [])
              ]
            }
      )
    )
    notify('Presupuesto base confirmado y enviado al cliente.')
  }

  const handleAdminProposalDecision = (orderId, proposalId, decision) => {
    if (!isAdmin) return
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const target = order.proposals.find((p) => p.id === proposalId)
        const nextStatus = decision === 'approve' ? 'pending_client' : 'rejected'
        const actionText =
          decision === 'approve'
            ? `Administración confirmó enviar "${target?.title}" (${formatRD(target?.amount)}) al portal del cliente.`
            : `Administración devolvió/descartó la cotización "${target?.title}".`

        return {
          ...order,
          proposals: order.proposals.map((p) =>
            p.id === proposalId ? { ...p, status: nextStatus } : p
          ),
          history: [
            { id: `H-${Date.now()}`, text: actionText, time: 'Justo ahora' },
            ...(order.history || [])
          ]
        }
      })
    )
    notify(
      decision === 'approve'
        ? 'Confirmado: Cotización enviada al cliente.'
        : 'Cotización descartada.'
    )
  }

  const handleConfirmSubmitProposal = () => {
    if (!selectedOrder || !canExecuteTechnicalWork(selectedOrder)) return
    const amountNum = Number(proposalDraft.amount)
    if (!proposalDraft.title.trim() || !amountNum || amountNum <= 0) return

    const newProp = {
      id: `PR-${Date.now().toString().slice(-4)}`,
      title: proposalDraft.title.trim(),
      description: proposalDraft.description.trim() || 'Especificado por el mecánico',
      reason: proposalDraft.reason.trim() || 'Detectado durante el diagnóstico técnico',
      amount: amountNum,
      status: 'pending_admin',
      createdBy: currentUser.name,
      createdAt: 'Justo ahora'
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id !== selectedOrder.id
          ? order
          : {
              ...order,
              proposals: [...(order.proposals || []), newProp],
              history: [
                {
                  id: `H-${Date.now()}`,
                  text: `Mecánico ${currentUser.name} cotizó pieza/reparación: "${newProp.title}" (${formatRD(newProp.amount)}) — Esperando confirmación de Administración.`,
                  time: 'Justo ahora'
                },
                ...(order.history || [])
              ]
            }
      )
    )

    setProposalDraft({ title: '', description: '', reason: '', amount: '' })
    setConfirmProposalModal(false)
    notify('Cotización enviada a Administración.')
  }

  const handleAddPayment = (e) => {
    e.preventDefault()
    if (!selectedOrder || !isAdmin) return
    const amountNum = Number(paymentDraft.amount)
    if (!amountNum || amountNum <= 0) return

    const payment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      amount: amountNum,
      method: paymentDraft.method,
      date: 'Justo ahora'
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id !== selectedOrder.id
          ? order
          : {
              ...order,
              payments: [...(order.payments || []), payment],
              history: [
                {
                  id: `H-${Date.now()}`,
                  text: `Administración confirmó recepción de pago por ${formatRD(amountNum)} (${paymentDraft.method}).`,
                  time: 'Justo ahora'
                },
                ...(order.history || [])
              ]
            }
      )
    )
    setPaymentDraft({ amount: '', method: 'Transferencia' })
    notify('Transacción de pago confirmada.')
  }

  const handleSaveDiagnosisOrNote = (e) => {
    e.preventDefault()
    if (!selectedOrder || !canExecuteTechnicalWork(selectedOrder) || !noteDraft.trim()) return

    setOrders((prev) =>
      prev.map((order) =>
        order.id !== selectedOrder.id
          ? order
          : {
              ...order,
              diagnosis: noteDraft.trim(),
              history: [
                {
                  id: `H-${Date.now()}`,
                  text: `Mecánico ${currentUser.name} actualizó el diagnóstico técnico: "${noteDraft.trim()}"`,
                  time: 'Justo ahora'
                },
                ...(order.history || [])
              ]
            }
      )
    )
    setNoteDraft('')
    notify('Diagnóstico técnico actualizado.')
  }

  const handleCreateOrder = (e) => {
    e.preventDefault()
    if (!isAdmin) return

    const nextNum = 249 + orders.length
    const created = {
      id: `OT-${String(nextNum).padStart(4, '0')}`,
      brand: newOrder.brand.trim(),
      model: newOrder.model.trim(),
      year: Number(newOrder.year) || 2022,
      vehicle: `${newOrder.brand.trim()} ${newOrder.model.trim()}`,
      plate: newOrder.plate.trim().toUpperCase(),
      client: newOrder.client.trim(),
      contact: newOrder.contact.trim(),
      email: '',
      mechanic: newOrder.mechanic,
      status: newOrder.mechanic ? 'assigned' : 'pending',
      description: newOrder.description.trim(),
      diagnosis: 'Pendiente de revisión y diagnóstico por el mecánico asignado.',
      initialBudget: 0,
      initialBudgetStatus: 'pending_mechanic',
      createdAt: 'Justo ahora',
      image: `https://carapi.trustcar.info/getImage?make=${encodeURIComponent(newOrder.brand.trim())}&model=${encodeURIComponent(newOrder.model.trim())}`,
      proposals: [],
      payments: [],
      history: [
        {
          id: `H-${Date.now()}`,
          text: `Recepción registró el ingreso del vehículo y lo asignó al mecánico ${newOrder.mechanic}.`,
          time: 'Justo ahora'
        }
      ]
    }

    setOrders((prev) => [created, ...prev])
    setShowCreateModal(false)
    setNewOrder({
      brand: '',
      model: '',
      year: '2022',
      plate: '',
      client: '',
      contact: '',
      mechanic: mechanicsList[0],
      description: ''
    })
    notify(`Orden ${created.id} creada y asignada a ${created.mechanic}.`)
  }

  const customers = useMemo(() => {
    const map = new Map()
    orders.forEach((o) => {
      if (!map.has(o.client)) {
        map.set(o.client, {
          name: o.client,
          contact: o.contact,
          email: o.email || '—',
          vehiclesCount: 1,
          activeOrders: !['completed', 'cancelled'].includes(o.status) ? 1 : 0
        })
      } else {
        const item = map.get(o.client)
        item.vehiclesCount += 1
        if (!['completed', 'cancelled'].includes(o.status)) item.activeOrders += 1
      }
    })
    return Array.from(map.values())
  }, [orders])

  const openPage = (page) => {
    setActivePage(page)
    setMobileMenu(false)
    setSearch('')
    setStatusFilter('Todos')
  }

  const pageDescription = {
    'Resumen': 'Visión general de las operaciones del taller y confirmaciones pendientes.',
    'Órdenes de trabajo': 'Consulta el estado de las órdenes y las cotizaciones emitidas por los mecánicos.',
    'Presupuestos': 'Bandeja de confirmación administrativa para enviar cotizaciones de mecánicos al cliente.',
    'Reparaciones': 'Seguimiento del estado técnico reportado por los mecánicos.',
    'Vehículos': 'Consulta los vehículos asociados a tus clientes y su estado.',
    'Clientes': 'Mantén organizada la información y el historial de tus clientes.',
    'Mecánicos': 'Consulta los miembros del taller y sus órdenes asignadas.'
  }

  const renderOrderTable = (data) => (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[880px] text-left">
          <thead>
            <tr className="border-y border-zinc-100 bg-zinc-50/70 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              <th className="px-6 py-4">Vehículo</th>
              <th className="px-4 py-4">Orden</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Mecánico</th>
              <th className="px-4 py-4">Presupuesto (Mecánico)</th>
              <th className="px-4 py-4">Estado Técnico</th>
              <th className="px-4 py-4">Etapa</th>
              <th className="px-6 py-4">Control de Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {data.map((order) => {
              const fin = computeOrderFinancials(order)
              const mechanicCanEdit = canExecuteTechnicalWork(order)
              const allowedNext = ALLOWED_TRANSITIONS[order.status] || []
              const pendingAdminCount =
                (order.proposals || []).filter((p) => p.status === 'pending_admin').length +
                (order.initialBudgetStatus === 'pending_admin' ? 1 : 0)
              const pendingClientCount = (order.proposals || []).filter(
                (p) => p.status === 'pending_client'
              ).length

              return (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id)
                    setDetailTab(isAdmin && pendingAdminCount > 0 ? 'presupuesto' : 'operativo')
                  }}
                  className="cursor-pointer transition hover:bg-zinc-50/80"
                >
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-semibold text-zinc-800">
                      {order.brand} {order.model} <span className="font-normal text-zinc-400">{order.year}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">{order.plate}</p>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-zinc-500">{order.id}</td>
                  <td className="px-4 py-4 text-xs text-zinc-600">{order.client}</td>
                  <td className="px-4 py-4 text-xs text-zinc-600">{order.mechanic}</td>
                  <td className="px-4 py-4">
                    {order.initialBudget === 0 ? (
                      <span className="text-[11px] text-zinc-400">Esperando cotización del mecánico</span>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-zinc-900">
                          {formatRD(fin.totalAuthorized)}
                        </p>
                        {pendingAdminCount > 0 ? (
                          <p className="mt-0.5 text-[10px] font-semibold text-amber-600">
                            {pendingAdminCount} por confirmar envío (Admin)
                          </p>
                        ) : pendingClientCount > 0 ? (
                          <p className="mt-0.5 text-[10px] font-medium text-blue-600">
                            {pendingClientCount} esperando al cliente
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[10px] text-zinc-400">
                            Base: {formatRD(fin.initial)}
                          </p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4">
                    <RepairStageStepper status={order.status} />
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {mechanicCanEdit ? (
                      <select
                        value={order.status}
                        disabled={allowedNext.length === 0}
                        onChange={(e) => handleStatusTransition(order.id, e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700 outline-none focus:border-indigo-500"
                        aria-label={`Cambiar estado de ${order.id}`}
                      >
                        <option value={order.status}>
                          {SESSION_STATUS_META[order.status]?.label || order.status}
                        </option>
                        {allowedNext.map((nextKey) => (
                          <option key={nextKey} value={nextKey}>
                            → {SESSION_STATUS_META[nextKey]?.label || nextKey}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400">
                        <Icon name="lock" size={12} />
                        {isAdmin ? 'Control del mecánico' : `Asignado a ${order.mechanic}`}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas optimizadas para pulgar en móvil */}
      <div className="divide-y divide-zinc-100 md:hidden">
        {data.map((order) => {
          const fin = computeOrderFinancials(order)
          const pendingAdminCount =
            (order.proposals || []).filter((p) => p.status === 'pending_admin').length +
            (order.initialBudgetStatus === 'pending_admin' ? 1 : 0)

          return (
            <div
              key={order.id}
              onClick={() => {
                setSelectedOrderId(order.id)
                setDetailTab(isAdmin && pendingAdminCount > 0 ? 'presupuesto' : 'operativo')
              }}
              className="flex flex-col gap-2.5 p-4 transition active:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">
                      {order.id}
                    </span>
                    <span className="text-[11px] text-zinc-400">{order.plate}</span>
                  </div>
                  <h4 className="mt-1 truncate text-sm font-semibold text-zinc-900">
                    {order.brand} {order.model}
                  </h4>
                  <p className="truncate text-xs text-zinc-500">
                    {order.client} · Mec.: {order.mechanic}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {pendingAdminCount > 0 && isAdmin && (
                <div className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800">
                  • {pendingAdminCount} cotización(es) por confirmar envío
                </div>
              )}

              <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs">
                <span className="text-zinc-500">
                  Autorizado:{' '}
                  <strong className="text-zinc-900">
                    {order.initialBudget === 0 ? 'Sin cotizar' : formatRD(fin.totalAuthorized)}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                  Gestionar <Icon name="chevron" size={14} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {data.length === 0 && (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Icon name="search" size={22} />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-700">No encontramos órdenes</p>
          <p className="mt-1 text-xs text-zinc-400">Prueba con otro término o cambia los filtros activos.</p>
        </div>
      )}
    </>
  )

  const renderSection = () => {
    if (activePage === 'Resumen') {
      const priorityItems = orders.filter(
        (o) =>
          ['waiting_parts', 'waiting_approval', 'paused', 'review'].includes(o.status) ||
          (o.proposals || []).some((p) => p.status === 'pending_admin') ||
          o.initialBudgetStatus === 'pending_admin'
      )

      return (
        <>
          <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium text-zinc-400 sm:text-sm">
                {isAdmin
                  ? 'Recepción y Administración'
                  : 'Panel Técnico de Mecánico'}
              </p>
              <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900 sm:text-[28px]">
                Buenos días, {currentUser.name.split(' ')[0]}.
              </h2>
            </div>

            {currentUser.role === 'mechanic' && (
              <div className="grid grid-cols-2 rounded-xl border border-zinc-200 bg-white p-1 sm:inline-flex">
                <button
                  onClick={() => setMechanicScope('assigned')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:py-1.5 ${
                    mechanicScope === 'assigned'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Mis asignadas
                </button>
                <button
                  onClick={() => setMechanicScope('all')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:py-1.5 ${
                    mechanicScope === 'all'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Consultar todas
                </button>
              </div>
            )}
          </section>

          {/* Cuadrícula 2x2 compacta en móvil, 4 columnas en escritorio */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 sm:p-5 transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-zinc-500 sm:text-[13px]">{stat.label}</span>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${stat.color}`}>
                    <Icon name={stat.icon} size={17} />
                  </span>
                </div>
                <p className="mt-3 truncate text-lg font-semibold tracking-tight text-zinc-900 sm:mt-5 sm:text-[26px]">
                  {stat.value}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-400 sm:text-xs">{stat.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <article className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">Órdenes recientes</h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Toca una orden para gestionar detalles.
                  </p>
                </div>
                <button
                  onClick={() => openPage('Órdenes de trabajo')}
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Ver todas <Icon name="chevron" size={15} />
                </button>
              </div>
              {renderOrderTable(filteredOrders.slice(0, 5))}
            </article>

            <div className="space-y-5">
              <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">Atención prioritaria</h3>
                    <p className="mt-0.5 text-xs text-zinc-400">Confirmaciones y avisos</p>
                  </div>
                  <Icon name="alert" className="text-amber-500" />
                </div>

                <div className="mt-4 space-y-2.5">
                  {isAdmin && pendingAdminProposals.length > 0 && (
                    <div
                      onClick={() => openPage('Presupuestos')}
                      className="cursor-pointer rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 transition hover:bg-amber-50"
                    >
                      <p className="text-xs font-semibold text-amber-900">
                        {pendingAdminProposals.length} cotización(es) por confirmar
                      </p>
                      <p className="mt-0.5 text-[11px] text-amber-700">
                        Autorizar envío al cliente →
                      </p>
                    </div>
                  )}

                  {priorityItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedOrderId(item.id)}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-zinc-100 p-3 transition hover:bg-zinc-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-zinc-800">
                          {item.vehicle} · {item.id}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">Mec.: {item.mechanic}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}

                  {priorityItems.length === 0 && (
                    <p className="py-4 text-center text-xs text-zinc-400">
                      No hay confirmaciones pendientes.
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">Actividad reciente</h3>
                  <Icon name="clock" className="text-zinc-400" />
                </div>
                <div className="mt-4 space-y-3.5">
                  {orders
                    .flatMap((o) =>
                      (o.history || []).map((h) => ({ ...h, orderId: o.id, vehicle: o.vehicle }))
                    )
                    .slice(0, 4)
                    .map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        <div className="min-w-0">
                          <p className="text-xs leading-relaxed text-zinc-700">{event.text}</p>
                          <p className="mt-0.5 text-[11px] text-zinc-400">
                            {event.orderId} · {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </article>
            </div>
          </section>
        </>
      )
    }

    if (activePage === 'Órdenes de trabajo' || activePage === 'Reparaciones') {
      return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">
                {activePage === 'Reparaciones' ? 'Seguimiento técnico de reparaciones' : 'Órdenes de trabajo'}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                {filteredOrders.length} resultados encontrados
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
              {currentUser.role === 'mechanic' ? (
                <div className="grid grid-cols-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                  <button
                    onClick={() => setMechanicScope('assigned')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      mechanicScope === 'assigned' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    Mis asignadas
                  </button>
                  <button
                    onClick={() => setMechanicScope('all')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      mechanicScope === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    Todas (Consulta)
                  </button>
                </div>
              ) : (
                <select
                  value={mechanicFilter}
                  onChange={(e) => setMechanicFilter(e.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none focus:border-indigo-500 sm:w-auto"
                >
                  <option value="Todos">Todos los mecánicos</option>
                  {mechanicsList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none focus:border-indigo-500 sm:w-auto"
              >
                <option value="Todos">Todos los estados</option>
                {Object.entries(SESSION_STATUS_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>

              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
                >
                  <Icon name="plus" size={16} />
                  Registrar ingreso
                </button>
              )}
            </div>
          </div>
          {renderOrderTable(filteredOrders)}
        </section>
      )
    }

    if (activePage === 'Presupuestos') {
      const filteredProps = allProposals.filter((p) => {
        if (proposalFilter !== 'Todos' && p.status !== proposalFilter) return false
        if (!search.trim()) return true
        return `${p.orderId} ${p.vehicle} ${p.client} ${p.title} ${p.createdBy}`
          .toLowerCase()
          .includes(search.toLowerCase())
      })

      return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">
                Confirmación de presupuestos
              </h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                El mecánico cotiza las piezas; Administración confirma su envío al cliente.
              </p>
            </div>

            <select
              value={proposalFilter}
              onChange={(e) => setProposalFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none focus:border-indigo-500 sm:w-auto"
            >
              <option value="Todos">Todos los estados ({allProposals.length})</option>
              <option value="pending_admin">Por confirmar envío ({pendingAdminProposals.length})</option>
              <option value="pending_client">Enviadas al cliente ({pendingClientProposals.length})</option>
              <option value="approved_client">Aprobadas por el cliente</option>
              <option value="rejected">Descartadas</option>
            </select>
          </div>

          {/* Tabla en Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-y border-zinc-100 bg-zinc-50/70 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Orden / Vehículo</th>
                  <th className="px-4 py-4">Diagnóstico y Pieza Cotizada</th>
                  <th className="px-4 py-4">Mecánico</th>
                  <th className="px-4 py-4">Precio Fijado</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Confirmación Secretaría / Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProps.map((prop) => (
                  <tr key={prop.id} className="hover:bg-zinc-50/70">
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-zinc-900">
                        {prop.orderId} · {prop.vehicle}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        Cliente: {prop.client} ({prop.plate})
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-zinc-800">{prop.title}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">{prop.reason}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-600">
                      {prop.createdBy}
                      <p className="text-[10px] text-zinc-400">{prop.createdAt}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-zinc-900">
                      {formatRD(prop.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <ProposalBadge status={prop.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {prop.status === 'pending_admin' && isAdmin ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleAdminProposalDecision(prop.orderId, prop.id, 'reject')}
                            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600"
                          >
                            Devolver
                          </button>
                          <button
                            onClick={() => handleAdminProposalDecision(prop.orderId, prop.id, 'approve')}
                            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
                          >
                            Confirmar y enviar al cliente
                          </button>
                        </div>
                      ) : prop.status === 'pending_client' ? (
                        <span className="text-[11px] text-zinc-400">
                          Enviada · Esperando decisión del cliente
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrderId(prop.orderId)
                            setDetailTab('presupuesto')
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Ver orden
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas de Presupuesto en Móvil (Sin scroll horizontal) */}
          <div className="divide-y divide-zinc-100 md:hidden">
            {filteredProps.map((prop) => (
              <div key={prop.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600">
                      {prop.orderId} · {prop.vehicle}
                    </span>
                    <h4 className="mt-0.5 text-sm font-semibold text-zinc-900">{prop.title}</h4>
                    <p className="mt-0.5 text-xs text-zinc-500">{prop.reason}</p>
                  </div>
                  <ProposalBadge status={prop.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Mec.: {prop.createdBy}</span>
                  <span className="text-sm font-bold text-zinc-900">{formatRD(prop.amount)}</span>
                </div>

                {prop.status === 'pending_admin' && isAdmin ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleAdminProposalDecision(prop.orderId, prop.id, 'reject')}
                      className="h-10 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 active:bg-red-50"
                    >
                      Devolver
                    </button>
                    <button
                      onClick={() => handleAdminProposalDecision(prop.orderId, prop.id, 'approve')}
                      className="h-10 rounded-xl bg-zinc-900 text-xs font-semibold text-white active:bg-indigo-600"
                    >
                      Enviar al cliente
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedOrderId(prop.orderId)
                      setDetailTab('presupuesto')
                    }}
                    className="w-full rounded-xl bg-zinc-50 py-2 text-center text-xs font-semibold text-indigo-600"
                  >
                    Abrir orden {prop.orderId} →
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredProps.length === 0 && (
            <p className="p-12 text-center text-xs text-zinc-400">
              No hay cotizaciones registradas con este filtro.
            </p>
          )}
        </section>
      )
    }

    if (activePage === 'Vehículos') {
      const filtered = orders.filter((v) =>
        `${v.brand} ${v.model} ${v.plate} ${v.client}`.toLowerCase().includes(search.toLowerCase())
      )

      return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <article
              key={v.id}
              onClick={() => setSelectedOrderId(v.id)}
              className="cursor-pointer overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-50 p-3">
                <img
                  src={v.image}
                  alt={v.vehicle}
                  className="max-h-24 w-full object-contain"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {v.brand} {v.model} · {v.year}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Matrícula: {v.plate} · {v.client}
                  </p>
                </div>
                <StatusBadge status={v.status} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                <span>Orden: {v.id}</span>
                <span>Mecánico: {v.mechanic}</span>
              </div>
            </article>
          ))}
        </section>
      )
    }

    if (activePage === 'Clientes') {
      const filtered = customers.filter((c) =>
        `${c.name} ${c.contact}`.toLowerCase().includes(search.toLowerCase())
      )

      return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          <div className="p-4 sm:p-5 sm:px-6">
            <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">Directorio de clientes</h3>
            <p className="mt-0.5 text-xs text-zinc-400">{filtered.length} clientes encontrados</p>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-4 py-4">Teléfono</th>
                  <th className="px-4 py-4">Correo</th>
                  <th className="px-4 py-4">Vehículos</th>
                  <th className="px-4 py-4">Órdenes activas</th>
                  <th className="px-6 py-4">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((client) => (
                  <tr key={client.name} className="hover:bg-zinc-50/70">
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-800">{client.name}</td>
                    <td className="px-4 py-4 text-xs text-zinc-500">{client.contact}</td>
                    <td className="px-4 py-4 text-xs text-zinc-500">{client.email}</td>
                    <td className="px-4 py-4 text-xs text-zinc-600">{client.vehiclesCount}</td>
                    <td className="px-4 py-4 text-xs font-semibold text-zinc-800">{client.activeOrders}</td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://wa.me/${client.contact}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista de clientes adaptada a móvil */}
          <div className="divide-y divide-zinc-100 md:hidden">
            {filtered.map((client) => (
              <div key={client.name} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{client.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {client.contact} · {client.vehiclesCount} vehículo(s)
                  </p>
                </div>
                <a
                  href={`https://wa.me/${client.contact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700"
                >
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </section>
      )
    }

    if (activePage === 'Mecánicos') {
      return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          <div className="p-4 sm:p-5 sm:px-6">
            <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">Miembros del taller</h3>
            <p className="mt-0.5 text-xs text-zinc-400">Equipo técnico y administrativo activo</p>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-4 py-4">Correo</th>
                  <th className="px-4 py-4">Rol</th>
                  <th className="px-4 py-4">Órdenes asignadas</th>
                  <th className="px-4 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {initialMembers.map((m) => {
                  const assignedCount = orders.filter(
                    (o) => o.mechanic === m.name && !['completed', 'cancelled'].includes(o.status)
                  ).length
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50/70">
                      <td className="px-6 py-4 text-sm font-semibold text-zinc-800">{m.name}</td>
                      <td className="px-4 py-4 text-xs text-zinc-500">{m.email}</td>
                      <td className="px-4 py-4 text-xs capitalize text-zinc-600">
                        {m.role === 'admin' ? 'Administración / Recepción' : 'Mecánico'}
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-600">
                        {m.role === 'mechanic' ? `${assignedCount} activas` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Activo
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-zinc-100 md:hidden">
            {initialMembers.map((m) => {
              const assignedCount = orders.filter(
                (o) => o.mechanic === m.name && !['completed', 'cancelled'].includes(o.status)
              ).length
              return (
                <div key={m.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{m.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {m.role === 'admin' ? 'Administración / Recepción' : `Mecánico · ${assignedCount} activas`}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Activo
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] pb-20 text-zinc-800 md:flex md:pb-0">
      {toast && (
        <div className="fixed bottom-20 right-4 left-4 z-[120] flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-xs font-semibold text-white shadow-xl sm:bottom-5 sm:left-auto sm:right-5">
          <Icon name="check" size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowNotifications(false)
            setShowProfile(false)
          }}
        />
      )}

      {mobileMenu && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200/80 bg-white transition-all duration-300 md:sticky md:top-0 md:h-screen ${
          mobileMenu
            ? 'translate-x-0 w-[260px]'
            : '-translate-x-full w-[260px] md:translate-x-0'
        } ${!mobileMenu && !sidebarExpanded ? 'md:w-[76px]' : 'md:w-[260px]'}`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-zinc-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <Icon name="wrench" size={21} />
            </div>
            {(sidebarExpanded || mobileMenu) && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-[17px] font-bold tracking-tight text-zinc-900">Josefo</h1>
                <p className="text-[10px] font-medium tracking-[0.14em] text-zinc-400">WORKSHOP MANAGEMENT</p>
              </div>
            )}
          </div>
          {mobileMenu && (
            <button
              onClick={() => setMobileMenu(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 md:hidden"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        <div className="px-3 pt-6">
          {(sidebarExpanded || mobileMenu) && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Menú principal
            </p>
          )}

          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = activePage === item.name
              const expanded = sidebarExpanded || mobileMenu

              return (
                <button
                  key={item.name}
                  onClick={() => openPage(item.name)}
                  title={!expanded ? item.name : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon name={item.icon} size={19} className="shrink-0" />
                  {expanded && <span className="whitespace-nowrap">{item.name}</span>}
                  {item.name === 'Presupuestos' && pendingAdminProposals.length > 0 && expanded && (
                    <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {pendingAdminProposals.length}
                    </span>
                  )}
                  {active && expanded && item.name !== 'Presupuestos' && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="relative mt-auto p-3">
          {(sidebarExpanded || mobileMenu) && (
            <Link
              to="/usuario"
              className="mb-3 flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
            >
              <span>Abrir Portal del Cliente</span>
              <Icon name="external" size={14} />
            </Link>
          )}

          {showProfile && (sidebarExpanded || mobileMenu) && (
            <div className="mb-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Cambiar usuario activo
              </p>
              <div className="mt-2 space-y-1">
                {initialMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setCurrentUser(member)
                      setShowProfile(false)
                      setMobileMenu(false)
                      notify(
                        `Sesión activa: ${member.name} (${
                          member.role === 'admin' ? 'Administración / Recepción' : 'Mecánico'
                        })`
                      )
                    }}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium ${
                      currentUser.id === member.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {member.name} · {member.role === 'admin' ? 'Recepción / Admin' : 'Mecánico'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-zinc-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            {(sidebarExpanded || mobileMenu) && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-800">{currentUser.name}</p>
                  <p className="text-[11px] text-zinc-400">
                    {isAdmin ? 'Recepción / Admin' : 'Mecánico'}
                  </p>
                </div>
                <Icon name="more" size={17} className="text-zinc-400" />
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur-xl sm:h-[76px] sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-xl border border-zinc-200/80 p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
              aria-label="Abrir menú"
            >
              <Icon name="menu" size={19} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium text-zinc-400 sm:text-[11px]">
                {isAdmin ? 'Modo Recepción / Admin' : `Mecánico: ${currentUser.name}`}
              </p>
              <h2 className="truncate text-base font-semibold tracking-tight text-zinc-900 sm:text-xl">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/70 px-2.5 transition focus-within:border-indigo-400 focus-within:bg-white sm:h-10 sm:px-3">
              <Icon name="search" size={15} className="text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-20 bg-transparent text-xs outline-none placeholder:text-zinc-400 sm:w-36 lg:w-44"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
                  <Icon name="close" size={13} className="text-zinc-400" />
                </button>
              )}
            </label>

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfile(false)
                }}
                aria-label="Notificaciones"
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition sm:h-10 sm:w-10 ${
                  showNotifications
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <Icon name="bell" size={17} />
                {pendingAdminProposals.length > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[310px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Notificaciones</h3>
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                      {pendingAdminProposals.length} por confirmar
                    </span>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {pendingAdminProposals.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowNotifications(false)
                          openPage('Presupuestos')
                        }}
                        className="flex cursor-pointer gap-3 rounded-lg p-2 hover:bg-zinc-50"
                      >
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-800">{p.title}</p>
                          <p className="mt-0.5 text-[11px] text-zinc-400">
                            {p.orderId} · Cotizado por {p.createdBy}: {formatRD(p.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {pendingAdminProposals.length === 0 && (
                      <p className="py-3 text-center text-xs text-zinc-400">
                        Sin cotizaciones pendientes de confirmar.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:h-10 sm:px-4"
              >
                <Icon name="plus" size={16} />
                <span className="hidden sm:inline">Registrar ingreso</span>
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:space-y-7 sm:p-8">
          {renderSection()}

          <footer className="hidden justify-between border-t border-zinc-200/70 pt-5 text-[11px] text-zinc-400 sm:flex">
            <span>Josefo Workshop · Gestión inteligente del taller</span>
            <span>Panel de administración · 2026</span>
          </footer>
        </main>
      </div>

      {/* Barra de Navegación Inferior Fija para Móvil */}
      <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/95 px-2 backdrop-blur-lg md:hidden">
        {[
          { name: 'Resumen', label: 'Inicio', icon: 'grid' },
          { name: 'Órdenes de trabajo', label: 'Órdenes', icon: 'clipboard' },
          { name: 'Presupuestos', label: 'Cotizaciones', icon: 'dollar', badge: pendingAdminProposals.length },
          { name: 'Vehículos', label: 'Vehículos', icon: 'car' }
        ].map((item) => {
          const active = activePage === item.name
          return (
            <button
              key={item.name}
              onClick={() => openPage(item.name)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold transition ${
                active ? 'text-indigo-600' : 'text-zinc-400'
              }`}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute right-4 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
        <button
          onClick={() => setMobileMenu(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold text-zinc-400"
        >
          <Icon name="menu" size={19} />
          <span>Más</span>
        </button>
      </nav>

      {/* Modal Detalle de Orden: Bottom Sheet en móvil, Modal centrado en Desktop */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 p-4 sm:p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {selectedOrder.id}
                  </span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <h2 className="mt-1.5 truncate text-base font-semibold tracking-tight text-zinc-900 sm:text-xl">
                  {selectedOrder.brand} {selectedOrder.model} ({selectedOrder.year}) · {selectedOrder.plate}
                </h2>
                <p className="mt-0.5 truncate text-xs text-zinc-400">
                  {selectedOrder.client} · Mecánico: {selectedOrder.mechanic}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="shrink-0 rounded-xl bg-zinc-100 p-2 text-zinc-500 transition hover:bg-zinc-200"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Pestañas cortas y limpias que nunca se parten en móvil */}
            <div className="grid grid-cols-3 border-b border-zinc-100 bg-zinc-50/70 px-2 sm:px-6">
              {[
                { id: 'operativo', label: 'Diagnóstico' },
                { id: 'presupuesto', label: `Presupuesto (${selectedOrder.proposals.length})` },
                { id: 'historial', label: 'Historial' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id)}
                  className={`border-b-2 py-3 text-center text-xs font-semibold transition ${
                    detailTab === t.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
              {detailTab === 'operativo' && (
                <>
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-semibold text-zinc-800">Estado técnico del vehículo</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          {SESSION_STATUS_META[selectedOrder.status]?.description}
                        </p>
                      </div>
                      <RepairStageStepper status={selectedOrder.status} />
                    </div>

                    {canExecuteTechnicalWork(selectedOrder) ? (
                      (ALLOWED_TRANSITIONS[selectedOrder.status] || []).length > 0 && (
                        <div className="mt-4 border-t border-zinc-200/70 pt-3">
                          <p className="mb-2 text-[11px] font-semibold text-zinc-500">
                            Cambiar etapa del vehículo:
                          </p>
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            {ALLOWED_TRANSITIONS[selectedOrder.status].map((nextSt) => (
                              <button
                                key={nextSt}
                                onClick={() => handleStatusTransition(selectedOrder.id, nextSt)}
                                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                → {SESSION_STATUS_META[nextSt]?.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-200/60 pt-2.5 text-[11px] text-zinc-400">
                        <Icon name="lock" size={12} />
                        <span>Control exclusivo del mecánico asignado ({selectedOrder.mechanic}).</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200/80 p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Solicitud de ingreso (Recepción)
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">
                        {selectedOrder.description}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200/80 p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Diagnóstico técnico ({selectedOrder.mechanic})
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-700">
                        {selectedOrder.diagnosis}
                      </p>
                    </div>
                  </div>

                  {canExecuteTechnicalWork(selectedOrder) && (
                    <form onSubmit={handleSaveDiagnosisOrNote} className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-700">
                        Actualizar diagnóstico técnico
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Describe el diagnóstico encontrado..."
                          className="h-11 flex-1 rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="h-11 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-indigo-600"
                        >
                          Guardar diagnóstico
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {detailTab === 'presupuesto' && (
                <>
                  {(() => {
                    const fin = computeOrderFinancials(selectedOrder)
                    return (
                      <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-zinc-50 p-3.5 sm:grid-cols-4">
                        <div>
                          <p className="text-[11px] text-zinc-400">Base diagnóstico</p>
                          <p className="mt-0.5 text-sm font-semibold text-zinc-800">
                            {selectedOrder.initialBudget === 0
                              ? 'Sin cotizar'
                              : formatRD(selectedOrder.initialBudget)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-400">Extras aprobados</p>
                          <p className="mt-0.5 text-sm font-semibold text-zinc-800">{formatRD(fin.approvedExtras)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-indigo-600">Total autorizado</p>
                          <p className="mt-0.5 text-sm font-bold text-indigo-600">{formatRD(fin.totalAuthorized)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-emerald-700">Balance pend.</p>
                          <p className="mt-0.5 text-sm font-bold text-emerald-700">
                            {formatRD(fin.balance)}
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {canExecuteTechnicalWork(selectedOrder) && (
                    <form
                      onSubmit={handleMechanicSetBaseBudget}
                      className="flex flex-col justify-between gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-3.5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-800">
                          Presupuesto base de mano de obra
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Fijado por el mecánico y confirmado por Administración.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Monto (RD$)"
                          value={baseBudgetDraft}
                          onChange={(e) => setBaseBudgetDraft(e.target.value)}
                          className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500 sm:w-36"
                        />
                        <button
                          type="submit"
                          className="h-10 shrink-0 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-indigo-600"
                        >
                          Fijar base
                        </button>
                      </div>
                    </form>
                  )}

                  {isAdmin && selectedOrder.initialBudgetStatus === 'pending_admin' && (
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-amber-900">
                          Mecánico {selectedOrder.mechanic} fijó base en {formatRD(selectedOrder.initialBudget)}
                        </p>
                        <p className="text-[11px] text-amber-700">
                          Confirma para publicarlo en el portal del cliente.
                        </p>
                      </div>
                      <button
                        onClick={() => handleAdminConfirmBaseBudget(selectedOrder.id)}
                        className="h-10 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-indigo-600"
                      >
                        Confirmar envío al cliente
                      </button>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-zinc-800">
                      Piezas y reparaciones cotizadas
                    </p>
                    <div className="mt-2.5 space-y-2.5">
                      {selectedOrder.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-200/80 p-3.5 text-xs sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-zinc-900">{prop.title}</span>
                              <ProposalBadge status={prop.status} />
                            </div>
                            <p className="mt-1 text-[11px] text-zinc-500">
                              {prop.reason} · Por {prop.createdBy}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <span className="text-sm font-bold text-zinc-900">{formatRD(prop.amount)}</span>
                            {isAdmin && prop.status === 'pending_admin' && (
                              <div className="grid grid-cols-2 gap-2 sm:flex">
                                <button
                                  onClick={() => handleAdminProposalDecision(selectedOrder.id, prop.id, 'reject')}
                                  className="h-9 rounded-lg border border-zinc-200 px-3 text-[11px] font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600"
                                >
                                  Devolver
                                </button>
                                <button
                                  onClick={() => handleAdminProposalDecision(selectedOrder.id, prop.id, 'approve')}
                                  className="h-9 rounded-lg bg-zinc-900 px-3 text-[11px] font-semibold text-white hover:bg-indigo-600"
                                >
                                  Enviar a cliente
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {selectedOrder.proposals.length === 0 && (
                        <p className="py-4 text-center text-xs text-zinc-400">
                          Sin piezas adicionales cotizadas.
                        </p>
                      )}
                    </div>
                  </div>

                  {canExecuteTechnicalWork(selectedOrder) && (
                    <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
                      <p className="text-xs font-semibold text-zinc-800">
                        Cotizar pieza o reparación adicional
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Pieza o trabajo necesario"
                          value={proposalDraft.title}
                          onChange={(e) => setProposalDraft((p) => ({ ...p, title: e.target.value }))}
                          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-indigo-500"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Precio (RD$)"
                          value={proposalDraft.amount}
                          onChange={(e) => setProposalDraft((p) => ({ ...p, amount: e.target.value }))}
                          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Justificación técnica del diagnóstico"
                          value={proposalDraft.reason}
                          onChange={(e) => setProposalDraft((p) => ({ ...p, reason: e.target.value }))}
                          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-indigo-500 sm:col-span-2"
                        />
                      </div>

                      {!confirmProposalModal ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!proposalDraft.title.trim() || !Number(proposalDraft.amount)) return
                            setConfirmProposalModal(true)
                          }}
                          className="mt-3 h-10 w-full rounded-xl bg-indigo-600 text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Enviar cotización a Administración
                        </button>
                      ) : (
                        <div className="mt-3 flex flex-col justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center">
                          <p className="text-[11px] font-medium text-amber-900">
                            ¿Confirmas enviar <strong>{proposalDraft.title}</strong> por{' '}
                            <strong>{formatRD(proposalDraft.amount)}</strong>?
                          </p>
                          <div className="grid grid-cols-2 gap-2 sm:flex">
                            <button
                              type="button"
                              onClick={() => setConfirmProposalModal(false)}
                              className="h-9 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-zinc-700"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmSubmitProposal}
                              className="h-9 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white"
                            >
                              Confirmar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isAdmin && (
                    <form onSubmit={handleAddPayment} className="border-t border-zinc-100 pt-4">
                      <p className="mb-2 text-xs font-semibold text-zinc-800">
                        Confirmar pago recibido del cliente
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:flex">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Monto recibido (RD$)"
                          value={paymentDraft.amount}
                          onChange={(e) => setPaymentDraft((p) => ({ ...p, amount: e.target.value }))}
                          className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                        />
                        <select
                          value={paymentDraft.method}
                          onChange={(e) => setPaymentDraft((p) => ({ ...p, method: e.target.value }))}
                          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none"
                        >
                          <option value="Transferencia">Transferencia</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta</option>
                        </select>
                        <button
                          type="submit"
                          className="h-10 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
                        >
                          Confirmar pago
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {detailTab === 'historial' && (
                <div className="space-y-2.5">
                  {(selectedOrder.history || []).map((h) => (
                    <div key={h.id} className="flex gap-3 rounded-xl border border-zinc-100 p-3 text-xs">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <div>
                        <p className="font-medium text-zinc-800">{h.text}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">{h.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recepción adaptado como Bottom Sheet en móvil */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Recepción de vehículo
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
                  Registrar ingreso y asignar mecánico
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl bg-zinc-100 p-2 text-zinc-500 transition hover:bg-zinc-200"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700">Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota"
                    value={newOrder.brand}
                    onChange={(e) => setNewOrder((p) => ({ ...p, brand: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="Corolla"
                    value={newOrder.model}
                    onChange={(e) => setNewOrder((p) => ({ ...p, model: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-xs font-semibold text-zinc-700">Matrícula</label>
                  <input
                    type="text"
                    required
                    placeholder="A912845"
                    value={newOrder.plate}
                    onChange={(e) => setNewOrder((p) => ({ ...p, plate: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-xs uppercase outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700">Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={newOrder.client}
                    onChange={(e) => setNewOrder((p) => ({ ...p, client: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700">Teléfono</label>
                  <input
                    type="tel"
                    required
                    placeholder="8290000000"
                    value={newOrder.contact}
                    onChange={(e) => setNewOrder((p) => ({ ...p, contact: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700">Mecánico asignado</label>
                <select
                  value={newOrder.mechanic}
                  onChange={(e) => setNewOrder((p) => ({ ...p, mechanic: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-indigo-500"
                >
                  {mechanicsList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700">
                  Síntoma o solicitud reportada por el cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ruido al frenar y revisión general..."
                  value={newOrder.description}
                  onChange={(e) => setNewOrder((p) => ({ ...p, description: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 sm:flex sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-11 rounded-xl border border-zinc-200 px-5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Registrar ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Main