import Main from './frontend/HomePage-taller/taller'
import Orden from './frontend/HomePage-taller/orden'
import Reparaciones from './frontend/HomePage-taller/reparaciones'
import { Routes, Route } from 'react-router-dom'
import UsuarioUI from './frontend/HomePage-usuario/usuario'

function App() {
  return (
    <section className='w-screen h-screen bg-zinc-200'>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/usuario' element={<UsuarioUI />} />
        <Route path='/orden' element={<Orden />} />
      </Routes>
    </section>
  )
}

export default App
