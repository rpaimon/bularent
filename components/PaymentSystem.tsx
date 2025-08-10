"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Shield, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

interface PaymentSystemProps {
  type: "premium_subscription" | "featured_listing" | "booking_deposit"
  amount: number
  propertyId?: string
  onSuccess?: () => void
}

export function PaymentSystem({ type, amount, propertyId, onSuccess }: PaymentSystemProps) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })
  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "FJ",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const getPaymentDescription = () => {
    switch (type) {
      case "premium_subscription":
        return "Premium Subscription - Access to premium features for 1 month"
      case "featured_listing":
        return "Featured Listing - Boost your property visibility for 30 days"
      case "booking_deposit":
        return "Booking Deposit - Secure your rental booking"
      default:
        return "Payment"
    }
  }

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Simulate payment processing (In real app, integrate with Stripe)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          amount,
          payment_type: type,
          status: "completed",
          stripe_payment_intent_id: `pi_${Date.now()}`, // Mock payment intent ID
          metadata: {
            card_last_four: cardDetails.number.slice(-4),
            payment_method: paymentMethod,
          },
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      // Update user or property based on payment type
      if (type === "premium_subscription") {
        await supabase.from("users").update({ is_premium: true }).eq("id", user.id)
      } else if (type === "featured_listing" && propertyId) {
        await supabase.from("properties").update({ featured: true }).eq("id", propertyId)
      }

      // Send notification
      await supabase.from("notifications").insert({
        receiver_id: user.id,
        title: "Payment Successful",
        message: `Your payment of $${amount} for ${getPaymentDescription()} has been processed successfully.`,
        type: "system",
      })

      setSuccess(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your payment of ${amount} has been processed successfully.</p>
          <Badge className="bg-green-100 text-green-800">Transaction Complete</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Secure Payment</span>
        </CardTitle>
        <CardDescription>{getPaymentDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={processPayment} className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">${amount}</span>
            </div>
            <p className="text-sm text-gray-600">{getPaymentDescription()}</p>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "card" && (
            <>
              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="font-semibold">Billing Address</h3>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={billingAddress.address}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Suva"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="12345"
                      value={billingAddress.postalCode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={billingAddress.country}
                    onValueChange={(value) => setBillingAddress({ ...billingAddress, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FJ">Fiji</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="NZ">New Zealand</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {paymentMethod === "bank" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Bank transfer details will be provided after you confirm this payment. Please allow 2-3 business days
                for processing.
              </AlertDescription>
            </Alert>
          )}

          {paymentMethod === "mobile" && (
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" placeholder="+679 123 4567" required />
              <p className="text-sm text-gray-600 mt-1">
                We support M-PAiSA, Vodafone M-Money, and other mobile payment services
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Your payment information is encrypted and secure</span>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${amount}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
