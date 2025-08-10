"use client"

import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, User, LogOut, Menu, Home, Search, Plus, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()

      // Subscribe to new notifications
      const subscription = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications()
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n) => n.status === "unread").length)
    }
  }

  const markAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ status: "read" }).eq("id", notificationId)

    fetchNotifications()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getDashboardLink = () => {
    if (!profile) return "/dashboard"

    switch (profile.role) {
      case "admin":
        return "/admin"
      case "landlord":
        return "/landlord"
      case "tenant":
        return "/tenant"
      default:
        return "/dashboard"
    }
  }

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          <Link to="/" className="flex items-center space-x-2 text-lg font-semibold">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link to="/properties" className="flex items-center space-x-2 text-lg">
            <Search className="h-5 w-5" />
            <span>Browse Properties</span>
          </Link>
          {user && profile?.role === "landlord" && (
            <Link to="/landlord/properties/new" className="flex items-center space-x-2 text-lg">
              <Plus className="h-5 w-5" />
              <span>Add Property</span>
            </Link>
          )}
          {user && (
            <>
              <Link to={getDashboardLink()} className="flex items-center space-x-2 text-lg">
                <Settings className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Button onClick={handleSignOut} variant="ghost" className="justify-start">
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                BulaRent
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/properties"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname === "/properties" ? "text-blue-600 font-semibold" : ""
                }`}
              >
                Browse Properties
              </Link>
              {user && profile?.role === "landlord" && (
                <Link to="/landlord/properties/new" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Add Property
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <MobileNav />

              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-2 font-semibold border-b">Notifications</div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="p-3 cursor-pointer"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{notification.title}</span>
                                {notification.status === "unread" && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <span className="text-xs text-gray-600">{notification.message}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="p-2">
                        <div className="font-medium">{profile?.name}</div>
                        <div className="text-sm text-gray-500">{profile?.email}</div>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {profile?.role}
                        </Badge>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={getDashboardLink()}>Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">Profile Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-cyan-900 text-white mt-20">
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
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <span className="sr-only">Facebook</span>📘
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <span className="sr-only">Instagram</span>📷
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <span className="sr-only">Twitter</span>🐦
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link to="/properties" className="hover:text-white transition-colors">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-blue-100">
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-white transition-colors">
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
