"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, Video, MoreVertical } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

interface ChatSystemProps {
  conversationId: string
  propertyId: string
  otherUserId: string
  otherUserName: string
}

export function ChatSystem({ conversationId, propertyId, otherUserId, otherUserName }: ChatSystemProps) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `property_id=eq.${propertyId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, propertyId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id (name, avatar_url)
      `)
      .eq("property_id", propertyId)
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .order("created_at", { ascending: true })

    if (data) {
      setMessages(data)

      // Mark messages as read
      await supabase.from("messages").update({ read: true }).eq("receiver_id", user?.id).eq("property_id", propertyId)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setLoading(true)

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: otherUserId,
      property_id: propertyId,
      message: newMessage.trim(),
    })

    if (!error) {
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)

      setNewMessage("")
    }

    setLoading(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col bg-white/80 backdrop-blur-sm border-blue-100">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                {otherUserName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Online
              </Badge>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
