import React from 'react'
import Hero from '../Components/Hero'
import FeaturedDestination from '../Components/FeaturedDestination'
import ExclusiveOffer from '../Components/ExclusiveOffer'
import Testimonial from '../Components/Testimonial'
import NewLetter from '../Components/NewLetter'

const home = () => {
  return (
    <div>
      <Hero />
      <FeaturedDestination />
      <ExclusiveOffer />
      <Testimonial />
      <NewLetter />
    </div>
  )
}

export default home
