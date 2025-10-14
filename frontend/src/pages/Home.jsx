import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MessageSquare,
  Users,
  Star,
  ArrowRight,
  Headphones,
  Shield,
  Truck,
  Sofa,
  Home,
  Palette,
  Award,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const FurnitureHome = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Hero Images - Fashion related beautiful images
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80",
      gradient: "bg-gradient-to-br from-amber-600 via-orange-500 to-red-500",
      title: "Fashion Fiesta",
      subtitle: "Discover the latest trends and premium fashion collections that define your unique style"
    },
    {
      url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80",
      gradient: "bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600",
      title: "Premium Style",
      subtitle: "Elevate your wardrobe with our curated collection of luxury fashion pieces"
    },
    {
      url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=80",
      gradient: "bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500",
      title: "Luxury Fashion",
      subtitle: "Experience premium quality clothing and accessories crafted with attention to detail"
    },
    {
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80",
      gradient: "bg-gradient-to-br from-pink-600 via-rose-500 to-orange-500",
      title: "Trending Now",
      subtitle: "From runway to wardrobe, we bring you the hottest fashion trends of the season"
    }
  ];

  const features = [
    {
      icon: ShoppingBag,
      title: 'Premium Fashion',
      description: 'Curated collection of high-end clothing and accessories from top designers',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Star,
      title: 'Trending Styles',
      description: 'Stay ahead of fashion with our latest trending collections and seasonal updates',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Palette,
      title: 'Personal Style',
      description: 'Express your unique personality with personalized fashion recommendations',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Exceptional quality materials and craftsmanship with satisfaction guarantee',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80"
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length, isAutoPlay]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Auto-changing Images */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all duration-300"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all duration-300"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 transform transition-all duration-1000">
              {heroImages[currentImageIndex]?.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto transform transition-all duration-1000 delay-300">
              {heroImages[currentImageIndex]?.subtitle}
            </p>
            <div className="space-x-4">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-xl font-semibold transition-all duration-300">
                View Gallery
              </button>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section with Hover Effects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Fashion Fiesta</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of style, elegance, and quality with our premium fashion collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className={`group p-8 ${feature.bgColor} rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-gray-100 overflow-hidden relative`}
                >
                  {/* Background Image on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                    <img src={feature.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect Icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Latest Collections</h2>
            <p className="text-xl text-gray-600">
              Browse through our stunning fashion collections and trending style inspirations
            </p>
          </div>

          {/* Responsive Gallery Grid with Different Layouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {galleryImages.map((image, index) => {
              // Different sizes for variety - masonry-like layout
              const getCardSize = (index) => {
                const sizes = [
                  "lg:col-span-2 lg:row-span-2", // Large card
                  "lg:col-span-1 lg:row-span-1", // Regular card
                  "lg:col-span-1 lg:row-span-1", // Regular card
                  "lg:col-span-2 lg:row-span-1", // Wide card
                  "lg:col-span-1 lg:row-span-2", // Tall card
                  "lg:col-span-1 lg:row-span-1"  // Regular card
                ];
                return sizes[index] || "lg:col-span-1 lg:row-span-1";
              };

              const getImageHeight = (index) => {
                const heights = [
                  "h-80 sm:h-96 lg:h-full", // Large card
                  "h-48 sm:h-56 lg:h-64",   // Regular card
                  "h-48 sm:h-56 lg:h-64",   // Regular card
                  "h-48 sm:h-56 lg:h-80",   // Wide card
                  "h-64 sm:h-80 lg:h-full", // Tall card
                  "h-48 sm:h-56 lg:h-64"    // Regular card
                ];
                return heights[index] || "h-48 sm:h-56 lg:h-64";
              };

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-gray-100 ${getCardSize(index)}`}
                >
                  <img
                    src={image}
                    alt={`Fashion Collection ${index + 1}`}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${getImageHeight(index)}`}
                    loading="lazy"
                  />

                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6">

                      {/* Top Icons */}
                      <div className="flex justify-between items-start">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                            Collection #{index + 1}
                          </span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 transform group-hover:scale-110">
                          <Heart className="w-7 h-7 text-white hover:text-red-400 hover:fill-red-400 transition-all duration-300 cursor-pointer drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Bottom Content */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 transform translate-y-4 group-hover:translate-y-0">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg">
                            {index === 0 ? "Premium Collection" :
                             index === 1 ? "Trending Styles" :
                             index === 2 ? "Casual Wear" :
                             index === 3 ? "Formal Attire" :
                             index === 4 ? "Accessories" : "Summer Collection"}
                          </h3>
                          <p className="text-sm text-white/90 drop-shadow">
                            {index === 0 ? "Luxury fashion pieces for the discerning customer" :
                             index === 1 ? "Latest trends in contemporary fashion" :
                             index === 2 ? "Comfortable everyday fashion essentials" :
                             index === 3 ? "Sophisticated business and evening wear" :
                             index === 4 ? "Complete your look with premium accessories" : "Light and breezy summer essentials"}
                          </p>

                          {/* Action Button */}
                          <div className="pt-2">
                            <button className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all duration-300 border border-white/30 hover:border-white/50 transform hover:scale-105">
                              View Collection
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Corner Element */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                  {/* Bottom Shine Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Gallery Stats */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
              <div className="text-gray-600 text-sm">Fashion Items</div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-purple-500 mb-2">50+</div>
              <div className="text-gray-600 text-sm">Brand Partners</div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-pink-500 mb-2">1000+</div>
              <div className="text-gray-600 text-sm">Happy Customers</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              View Full Gallery
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Style?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover our premium fashion collections and express your unique personality through style
          </p>
          <div className="space-x-4">
            <button className="inline-flex items-center px-8 py-4 bg-white text-orange-600 hover:bg-gray-100 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-orange-600 rounded-xl font-semibold transition-all duration-300">
              Contact Stylist
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                From personal styling to wardrobe consultation, we provide comprehensive fashion and styling services.
              </p>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'Complimentary shipping on orders over LKR 100' },
                { icon: Shield, title: 'Quality Guarantee', desc: 'Premium quality assurance on all items' },
                { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer service' },
                { icon: Star, title: 'Personal Stylist', desc: 'Professional fashion consultants' }
              ].map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                      <p className="text-gray-600 text-sm">{service.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FurnitureHome;