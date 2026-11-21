
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log(formData)
  }

  const inputClass = `
    w-full h-12 px-4 rounded-xl
    bg-white border border-zinc-200
    text-sm text-zinc-900 placeholder:text-zinc-400
    outline-none transition-all duration-200
    hover:border-zinc-300
    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
  `

  return (
    <main className="min-h-screen bg-white grid lg:grid-cols-2">

      {/* Panel de presentación */}
      <section className="relative hidden lg:flex min-h-screen flex-col justify-between overflow-hidden bg-[#101629] p-12 xl:p-16 text-white">

        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1800&auto=format&fit=crop')"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#101629]/95 via-[#101629]/85 to-indigo-950/90" />

        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <span className="text-2xl font-bold tracking-tight">
              mechanic<span className="text-indigo-400">.</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl py-16">

          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-medium text-indigo-200 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Gestión inteligente para talleres
          </span>

          <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.12]">
            Gestiona tu taller
            <br />
            de forma
            <br />
            <span className="text-indigo-400">inteligente.</span>
          </h1>

          <p className="mt-7 text-base xl:text-lg text-zinc-300 leading-relaxed max-w-md">
            Todas las herramientas que necesitas para organizar tu taller, administrar tus operaciones y mantener a tus clientes informados.
          </p>

          <div className="mt-12 space-y-6">

            {[
              {
                number: '01',
                title: 'Órdenes de trabajo',
                description: 'Controla cada reparación desde un solo lugar.'
              },
              {
                number: '02',
                title: 'Gestión de vehículos',
                description: 'Mantén organizada la información de tus clientes.'
              },
              {
                number: '03',
                title: 'Seguimiento de reparaciones',
                description: 'Mantén a tus clientes informados.'
              }
            ].map((item) => (
              <div key={item.number} className="flex items-start gap-5">
                <span className="text-sm font-semibold text-indigo-400 pt-0.5">
                  {item.number}
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm text-zinc-400 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <span>mechanic. © 2026</span>
          <span>Construido para talleres modernos.</span>
        </div>

      </section>

      {/* Panel de inicio de sesión */}
      <section className="min-h-screen flex items-center justify-center px-6 py-12 sm:px-12 lg:px-10 xl:px-20 bg-[#fafbfe] relative overflow-hidden">

        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[440px]">

          <div className="flex items-center justify-between mb-16 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">m.</span>
              </div>

              <span className="text-xl font-bold tracking-tight text-zinc-900">
                mechanic<span className="text-indigo-600">.</span>
              </span>
            </Link>

            <Link to="/register" className="text-sm font-medium text-indigo-600">
              Crear cuenta
            </Link>
          </div>

          <div className="mb-10">

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Bienvenido de nuevo
            </span>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 mt-3">
              Inicia sesión<span className="text-indigo-600">.</span>
            </h2>

            <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
              Accede a tu espacio de trabajo y continúa gestionando tu taller.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Correo electrónico
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nombre@correo.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Contraseña
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  required
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c5 0 9 5 9 7a10 10 0 0 1-3 3.8M6.2 6.2C3.9 7.7 3 10.1 3 12c0 2 4 7 9 7 1.1 0 2.1-.2 3-.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                      <path d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7Z" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              Iniciar sesión

              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

          </form>

          <div className="flex items-center gap-4 my-9">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-400">
              ¿Eres nuevo en mechanic?
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <Link
            to="/register"
            className="w-full h-12 flex items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition"
          >
            Crear una cuenta
          </Link>

          <p className="text-xs text-center text-zinc-400 mt-10 leading-relaxed">
            mechanic. © 2026. Gestión inteligente para talleres automotrices.
          </p>

        </div>
      </section>

    </main>
  )
}

export default Login
