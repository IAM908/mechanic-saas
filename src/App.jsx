
import { Routes, Route } from 'react-router-dom'

import Main from './frontend/admin/taller.jsx'
import Reparaciones from './frontend/admin/reparaciones.jsx'

import UsuarioUI from './frontend/cliente/usuario.jsx'

import LandingPage from './frontend/HomePage/landingPage/landingPage.jsx'
import Register from './frontend/HomePage/subscription/register.jsx'
import Login from './frontend/HomePage/subscription/login.jsx'

function App() {
  return (
    <section className='min-h-screen w-full bg-zinc-200'>
      <Routes>
        <Route path='/' element={<LandingPage />} />

        <Route path='/admin-dashboard' element={<Main />} />
        <Route path='/reparaciones' element={<Reparaciones />} />

        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />

        <Route path='/usuario' element={<UsuarioUI />} />
      </Routes>
    </section>
  )
}

export default App
