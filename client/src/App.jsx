import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.component'
import { Navbar } from './components/navbar.component'
import Dashboard from './components/dashboard.component'
import AuctionDetailPage from './components/auctiondetails.component'

export default function App() {
  return (
    <Routes>
      <Route element={<Navbar/>} >
        <Route path='/' element={<Home/>} />
        <Route path='/auction/dashboard' element={<Dashboard/>} />
        <Route path='/auction/item/:id' element={<AuctionDetailPage/>} />
      </Route>
    </Routes>
  )
}