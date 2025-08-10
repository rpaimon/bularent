"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Filter, Star, Heart, Eye, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [properties] = useState([
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
      featured: false,
      landlord: { name: "Sarah Johnson", verified: false },
      ratings: { average: 4.2, count: 5 },
    },
    {
      id: "4",
      title: "Family House in Lautoka",
      description: "Spacious 4-bedroom house perfect for families.",
      location: "Lautoka",
      price: 1800,
      bedrooms: 4,
      bathrooms: 3,
      property_type: "House",
      images: ["/lautoka-family-house.png"],
      featured: false,
      landlord: { name: "Ratu Meli", verified: true },
      ratings: { average: 4.5, count: 15 },
    },
    {
      id: "5",
      title: "Luxury Penthouse in Suva",
      description: "Premium penthouse with panoramic city views.",
      location: "Suva",
      price: 3500,
      bedrooms: 3,
      bathrooms: 3,
      property_type: "Penthouse",
      images: ["/luxury-penthouse-suva.png"],
      featured: true,
      landlord: { name: "Maria Santos", verified: true },
      ratings: { average: 4.9, count: 7 },
    },
    {
      id: "6",
      title: "Affordable 1BR in Nasinu",
      description: "Budget-friendly apartment for students and young professionals.",
      location: "Nasinu",
      price: 450,
      bedrooms: 1,
      bathrooms: 1,
      property_type: "Apartment",
      images: ["/affordable-apartment-nasinu.png"],
      featured: false,
      landlord: { name: "John Prasad", verified: false },
      ratings: { average: 4.0, count: 3 },
    },
  ])

  const [filteredProperties, setFilteredProperties] = useState(properties)

  useEffect(() => {
    let filtered = properties

    if (searchQuery) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedLocation) {
      filtered = filtered.filter((property) => property.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    if (selectedType) {
      filtered = filtered.filter((property) => property.property_type === selectedType)
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number)
      filtered = filtered.filter((property) => {
        if (max) {
          return property.price >= min && property.price <= max
        } else {
          return property.price >= min
        }
      })
    }

    setFilteredProperties(filtered)
  }, [searchQuery, selectedLocation, selectedType, priceRange, properties])

  const locations = ["Suva", "Nadi", "Lautoka", "Tamavua", "Nasinu"]
  const propertyTypes = ["Apartment", "House", "Villa", "Studio", "Penthouse"]
  const priceRanges = [
    { label: "Under $500", value: "0-500" },
    { label: "$500 - $1000", value: "500-1000" },
    { label: "$1000 - $2000", value: "1000-2000" },
    { label: "$2000 - $3000", value: "2000-3000" },
    { label: "Above $3000", value: "3000" },
  ]

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
              <Link href="/properties" className="text-blue-600 font-medium">
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Browse Properties</h1>
          <p className="text-gray-600">Find your perfect home from our collection of verified properties</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Prices</option>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedLocation("")
                  setSelectedType("")
                  setPriceRange("")
                }}
                variant="outline"
                className="bg-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
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
                    {property.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Featured</Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 capitalize">
                      {property.property_type}
                    </Badge>
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

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

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

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
