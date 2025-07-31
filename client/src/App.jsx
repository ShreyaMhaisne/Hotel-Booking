import React from 'react'
import Navbar from './Components/Navbar'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/home'
import Footer from './Components/Footer'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import MyBooking from './pages/MyBooking'
import HotelReg from './Components/HotelReg'
import Layout from './pages/hotelOwner/Layout'
import DashBoard from './pages/hotelOwner/DashBoard'
import AddRoom from './pages/hotelOwner/AddRoom'
import ListRoom from './pages/hotelOwner/ListRoom'

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");

  return (
    <div>
      {!isOwnerPath && <Navbar />}
      {false && <HotelReg />}
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomDetails />} />
          <Route path='/my-bookings' element={<MyBooking />} />
          <Route path='/owner' element={<Layout />}>
            <Route index element={<DashBoard />} />
           <Route path='add-room' element={<AddRoom />}/>
               <Route path='list-room' element={<ListRoom />}/>
              </Route>
            </Routes>
          </div>
          <Footer />
      </div>
      )
}

      export default App
