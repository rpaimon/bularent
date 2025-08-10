"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Star, Heart, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  property_type: string
  images: string[]
  featured: boolean
  landlord?: {
    name: string
    verified: boolean
  }
  ratings?: {
    average: number
    count: number
  }
}

interface PropertyCardProps {
  property: Property
  showActions?: boolean
  onFavorite?: (id: string) => void
  onInquire?: (id: string) => void
}

export function PropertyCard({ property, showActions = true, onFavorite, onInquire }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavorite?.(property.id)
  }

  const handleInquire = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onInquire?.(property.id)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100">
      <div className="relative">
        {/* Image Carousel */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[currentImageIndex] || "/placeholder.svg?height=200&width=300&query=property"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                →
              </button>

              {/* Image Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {property.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {property.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Featured</Badge>
            )}
            <Badge variant="secondary" className="bg-white/90 text-gray-800 capitalize">
              {property.property_type}
            </Badge>
          </div>

          {/* Favorite Button */}
          {showActions && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </button>
          )}
        </div>

        <CardContent className="p-4">
          {/* Price */}
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

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center space-x-4 mb-4 text-gray-600">
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms} bath</span>
            </div>
          </div>

          {/* Landlord Info */}
          {property.landlord && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{property.landlord.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">{property.landlord.name}</div>
                  {property.landlord.verified && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2">
              <Link to={`/properties/${property.id}`} className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Button
                onClick={handleInquire}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Inquire
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
