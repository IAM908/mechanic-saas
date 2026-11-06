
import React, { useState } from 'react'

const Orden = () => {
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    marca: '',
    modelo: '',
    año: '',
    matricula: '',
    mecanico_id: '',
    descripcion: ''
  })

  const steps = [
    { id: 1, title: 'Cliente', subtitle: 'Propietario', icon: 'fa-user' },
    { id: 2, title: 'Vehículo', subtitle: 'Información', icon: 'fa-car' },
    { id: 3, title: 'Asignación', subtitle: 'Servicio', icon: 'fa-wrench' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const nextStep = () => {
    const form = document.getElementById('orden-form')

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    setStep(prev => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }

  const inputStyle = `
    w-full rounded-xl border border-gray-200 bg-white
    px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400
    outline-none transition-all duration-200
    hover:border-gray-300
    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
  `

  const labelStyle = 'mb-2 block text-sm font-medium text-gray-700'

  const progress = (step / 3) * 100

  return (
    <section className="min-h-screen bg-[#F9FAFB] px-4 py-8 sm:px-8 lg:py-12">

      <main className="mx-auto max-w-4xl">

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <span>Órdenes de trabajo</span>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="font-medium text-blue-600">Nueva orden</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Nueva orden de trabajo
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-500">
                Registra los datos del cliente, identifica su vehículo y
                asigna un mecánico responsable.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <i className="fa-solid fa-plus mr-1.5" />
              Registro nuevo
            </span>
          </div>
        </header>

        {/* Stepper */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Progreso del registro
            </span>

            <span className="text-sm font-medium text-blue-600">
              Paso {step} de 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {steps.map((item) => {
              const active = step === item.id
              const completed = step > item.id

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2.5 rounded-xl p-2 transition-colors sm:p-3 ${
                    active ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition-colors ${
                      completed
                        ? 'bg-blue-600 text-white'
                        : active
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {completed ? (
                      <i className="fa-solid fa-check" />
                    ) : (
                      <i className={`fa-solid ${item.icon}`} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-xs font-semibold sm:text-sm ${
                      active || completed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {item.title}
                    </p>

                    <p className="hidden text-xs text-gray-400 sm:block">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <form
          id="orden-form"
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >

          {/* Step content */}
          <div className="p-6 sm:p-8">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-in fade-in duration-300">

                <div className="mb-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <i className="fa-solid fa-user text-lg" />
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Información del cliente
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Introduce los datos personales del propietario del vehículo.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label htmlFor="nombre" className={labelStyle}>
                      Nombre <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="nombre"
                      className={inputStyle}
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Juan"
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="apellido" className={labelStyle}>
                      Apellido <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="apellido"
                      className={inputStyle}
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Ej. Pérez"
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="telefono" className={labelStyle}>
                      Número de teléfono <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                      <input
                        id="telefono"
                        className={`${inputStyle} pl-11`}
                        name="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="809-000-0000"
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Utiliza un número de contacto válido.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-in fade-in duration-300">

                <div className="mb-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <i className="fa-solid fa-car text-lg" />
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Información del vehículo
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Registra los datos de identificación del vehículo.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label htmlFor="marca" className={labelStyle}>
                      Marca <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="marca"
                      className={inputStyle}
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      placeholder="Ej. Toyota"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="modelo" className={labelStyle}>
                      Modelo <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="modelo"
                      className={inputStyle}
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleChange}
                      placeholder="Ej. Corolla"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="año" className={labelStyle}>
                      Año <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="año"
                      className={inputStyle}
                      type="number"
                      name="año"
                      value={formData.año}
                      onChange={handleChange}
                      placeholder="2022"
                      min="1900"
                      max="2099"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="matricula" className={labelStyle}>
                      Matrícula <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="matricula"
                      className={inputStyle}
                      name="matricula"
                      value={formData.matricula}
                      onChange={handleChange}
                      placeholder="Ej. A123456"
                      required
                    />
                  </div>

                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <i className="fa-solid fa-circle-info mt-0.5 text-blue-500" />

                  <p className="text-xs leading-relaxed text-gray-500">
                    Verifica que la matrícula y los datos del vehículo
                    sean correctos antes de continuar.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-in fade-in duration-300">

                <div className="mb-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <i className="fa-solid fa-wrench text-lg" />
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Asignación del servicio
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Selecciona al responsable y describe el trabajo solicitado.
                  </p>
                </div>

                {/* Summary */}
                <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Resumen del registro
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                        <i className="fa-solid fa-user text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Cliente</p>
                        <p className="truncate text-sm font-medium text-gray-800">
                          {formData.nombre} {formData.apellido}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                        <i className="fa-solid fa-car text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Vehículo</p>
                        <p className="truncate text-sm font-medium text-gray-800">
                          {formData.marca} {formData.modelo} {formData.año}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="space-y-5">

                  <div>
                    <label htmlFor="mecanico_id" className={labelStyle}>
                      Mecánico responsable <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <i className="fa-solid fa-user-gear absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                      <select
                        id="mecanico_id"
                        className={`${inputStyle} appearance-none pl-11 pr-10`}
                        name="mecanico_id"
                        value={formData.mecanico_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar mecánico</option>
                      </select>

                      <i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Los mecánicos disponibles se cargarán desde el backend.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="descripcion" className={labelStyle}>
                      Descripción del problema <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="descripcion"
                      className={`${inputStyle} min-h-32 resize-y`}
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Describe los síntomas, fallos o servicios que solicita el cliente..."
                      required
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Proporciona detalles que ayuden al mecánico a comprender el trabajo.
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Footer navigation */}
          <footer className="flex flex-col-reverse justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-5 sm:flex-row sm:items-center sm:px-8">

            <div className="text-xs text-gray-400">
              <i className="fa-solid fa-lock mr-1.5" />
              Información del taller
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  <i className="fa-solid fa-arrow-left mr-2" />
                  Atrás
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Continuar
                  <i className="fa-solid fa-arrow-right ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <i className="fa-solid fa-check mr-2" />
                  Crear orden de trabajo
                </button>
              )}

            </div>
          </footer>

        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          Josefo Workshop · Gestión de servicios automotrices
        </p>

      </main>
    </section>
  )
}

export default Orden
