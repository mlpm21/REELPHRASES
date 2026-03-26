import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'


// using layout - only render the navbar once
// outlet - content depend on that pages
function Layout() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Outlet />
    </div>
  )
}

export default Layout