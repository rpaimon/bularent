"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Users, Shield, Star, TrendingUp, Home, Heart, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Homepage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [featuredProperties] = useState([
    {
      id: "1",
      title: "Modern 2BR Apartment in Suva CBD",
      description: "Beautiful modern apartment in the heart of Suva with stunning harbor views.",
      location: "Suva CBD",
      price: 1200,
      bedrooms: 2,
      bathrooms: 2,
      property_type: "Apartment",
      images: ["/modern-apartment-suva.png"],
      featured: true,
      landlord: { name: "Mere Ratunabuabua", verified: true },
      ratings: { average: 4.8, count: 12 },
    },
    {
      id: "2",
      title: "Beachfront Villa in Nadi",
      description: "Stunning 3-bedroom villa just steps from the beach.",
      location: "Nadi",
      price: 2500,
      bedrooms: 3,
      bathrooms: 3,
      property_type: "Villa",
      images: ["/beachfront-villa-nadi.png"],
      featured: true,
      landlord: { name: "Jone Vuki", verified: true },
      ratings: { average: 4.9, count: 8 },
    },
    {
      id: "3",
      title: "Cozy Studio in Tamavua",
      description: "Perfect starter home for young professionals.",
      location: "Tamavua",
      price: 650,
      bedrooms: 1,
      bathrooms: 1,
      property_type: "Studio",
      images: ["/studio-apartment-tamavua.png"],
      featured: true,
      landlord: { name: "Sarah Johnson", verified: false },
      ratings: { average: 4.2, count: 5 },
    },
  ])

  const [stats] = useState({
    totalProperties: 150,
    totalUsers: 500,
    averageRating: 4.6,
  })

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`
    } else {
      window.location.href = "/properties"
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                BulaRent
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition-colors">
                Browse Properties
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/fiji-beach-sunset.png')`,
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Home in
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Paradise
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Discover amazing properties across Fiji's beautiful islands
          </p>

          <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Enter location (e.g., Suva, Nadi, Lautoka)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 border-0 bg-transparent text-gray-800 placeholder:text-gray-500"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Properties
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.totalProperties}+</div>
              <div className="text-gray-200">Properties Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.totalUsers}+</div>
              <div className="text-gray-200">Happy Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.averageRating}</div>
              <div className="text-gray-200">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Properties</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Handpicked premium properties from verified landlords across Fiji
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property) => (
              <Card
                key={property.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100"
              >
                <div className="relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded text-xs font-semibold">
                        Featured
                      </span>
                      <span className="bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium capitalize">
                        {property.property_type}
                      </span>
                    </div>

                    <button className="absolute top-3 right-3 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-blue-600">
                        ${property.price.toLocaleString()}
                        <span className="text-sm text-gray-500 font-normal">/month</span>
                      </div>
                      {property.ratings && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{property.ratings.average}</span>
                          <span className="text-sm text-gray-500">({property.ratings.count})</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    <div className="flex items-center space-x-4 mb-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Home className="w-4 h-4" />
                        <span className="text-sm">{property.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Home className="w-4 h-4" />
                        <span className="text-sm">{property.bathrooms} bath</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/properties/${property.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                        Inquire
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/properties">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose BulaRent?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We make finding and renting properties in Fiji simple, safe, and transparent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Properties</h3>
                <p className="text-gray-600">All properties are verified by our team for authenticity and quality</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
                <p className="text-gray-600">Connect with verified landlords and tenants in Fiji's rental community</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rating System</h3>
                <p className="text-gray-600">Transparent ratings and reviews help you make informed decisions</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Market Insights</h3>
                <p className="text-gray-600">Get real-time market data and pricing insights for better decisions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied users who found their perfect rental through BulaRent
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Browse Properties
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Sign Up Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-cyan-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-2xl font-bold">BulaRent</span>
              </div>
              <p className="text-blue-100 mb-4">
                Fiji's premier property rental platform. Find your perfect home in paradise.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link href="/properties" className="hover:text-white transition-colors">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-100">
            <p>&copy; 2024 BulaRent. All rights reserved. Made with 💙 in Fiji.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
