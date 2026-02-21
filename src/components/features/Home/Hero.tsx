"use client"
import { useState, useEffect } from 'react'
import { Heart, ArrowDown, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'

export default function Hero(){
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Carousel images with captions
  const carouselItems = [
    {
      image: "https://drive.google.com/uc?export=download&id=1UzGiXpzKlDVZ8OAnkwHiZ2n0k5sOrM1Y",
      title: "Building Hope, Changing Lives",
      subtitle: "Together, we create lasting impact in communities around the world",
      highlight: "Changing Lives"
    },
    {
      image: "https://drive.google.com/uc?export=view&id=1s5R80sQQt1rIqSM1kjsLYYM4SqEKav_P",
      title: "Transforming Communities",
      subtitle: "Through compassion, dedication, and unwavering commitment",
      highlight: "Transforming Communities"
    },
    {
      image: "https://drive.google.com/uc?export=view&id=1VO0zTH9JMgOVIJXmuTsE7mPIrk0uUVcl",
      title: "Empowering Futures",
      subtitle: "Creating opportunities for growth and sustainable development",
      highlight: "Empowering Futures"
    }
  ]
  
  const nextSlide = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    setTimeout(() => setIsTransitioning(false), 800)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
    setTimeout(() => setIsTransitioning(false), 800)
  }

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 800)
  }

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide()
      }
    }, 6000)
    
    return () => clearInterval(interval)
  }, [isTransitioning])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if(e.key === 'ArrowLeft'){
        prevSlide();
      } else if (e.key === 'ArrowRight'){
        nextSlide();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  })


  return (
    <section id="hero" className="relative pt-40 h-screen flex justify-center items-center overflow-hidden">
      {/* Carousel Container */}
      <div className="absolute inset-0">
        {carouselItems.map((item, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image 
              src={item.image}
              fill
              alt="Foundation Hero"
              className="w-full h-full object-cover object-top"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          </div>
        ))}

      </div>

      {/* Left and Right Arrow Controls */}
      <div className="hidden md:flex absolute inset-y-0 left-0 z-30 items-center justify-start pl-4 md:pl-6">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      
      <div className="hidden md:flex absolute inset-y-0 right-0 z-30 items-center justify-end pr-4 md:pr-6">
        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-white px-6 flex flex-col w-full max-w-7xl items-center">
        <div className="mb-8 w-full max-w-6xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-5 md:mb-20 leading-tight animate-fade-in-up">
            {/* {carouselItems[currentSlide].title.split(',')[0]}, */}
            Puso ng Ama Foundation Inc.
            <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mt-2">
              {carouselItems[currentSlide].highlight}
            </span>
          </h1>
          
          <p className="text-xs md:text-xl mb-8 max-w-7xl leading-relaxed opacity-90 animate-fade-in-up delay-150">
            In 2005 father Paul Uwemedimo responded to the situation in Payatas and established the PNA foundation which means HEART OF THE FATHER with the aim of personal and social transformation of individuals, families and communities. This is achieved through a child and youth development, education, human and spiritual formation and community development, income generation, health and property ownership.  
 
          </p>


        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-10 animate-fade-in-up delay-300">
          <button className="group relative px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-xs md:text-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 flex items-center">
            <span className="flex items-center justify-center">
              Make a Donation
              <Heart className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
          
          <button className="group px-4 py-2 md:px-8 md:py-4 border-2 border-white/80 rounded-xl text-xs md:text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center">
            <span>Learn Our Story</span>
            <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mb-8">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-red-500' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

            <div className='absolute w-20 h-20 bottom-10 right-5 md:top-[-100px] md:right-0 md:w-[300px] md:h-[300px] rounded-full -z-5'>
              <Image
                src='https://drive.google.com/uc?export=view&id=1GYeMYHzSAjCAA4X72AS6MF9IwYar9JlW'
                alt='Logo'
                fill
                className='w-full h-full rounded-full object-cover'
              />
          </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hidden md:block md:absolute bottom-8 left-1/2 right-1/2 transform -translate-x-1/2 z-20 animate-bounce-slow">
        <div className="flex flex-col items-center">
          
          <ArrowDown className="w-6 h-6 text-white/80" />
        </div>
      </div>

      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
      
      {/* Animation for new slide */}
      {isTransitioning && (
        <div className="absolute inset-0 z-15 bg-white animate-fade-out"></div>
      )}

      
    </section>
  )
}