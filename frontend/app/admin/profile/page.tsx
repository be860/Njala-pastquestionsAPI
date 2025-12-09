"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone, Save, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { profileApi } from "@/lib/api/profile"
import { useToast } from "@/hooks/use-toast"
import { UserAvatar } from "@/components/user-avatar"
import { resolveAvatarUrl } from "@/lib/utils"

export default function AdminProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/login")
      return
    }

    const loadProfile = async () => {
      try {
        const profile = await profileApi.getProfile()
        const nameParts = profile.fullName?.split(" ") || ["", ""]
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: profile.email || "",
          phone: profile.phoneNumber || "",
        })
        setAvatarUrl(profile.avatarUrl || null)
      } catch (error: any) {
        if (user) {
          const nameParts = user.fullName?.split(" ") || ["", ""]
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: "",
          })
          setAvatarUrl(user.avatarUrl || null)
        }
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user, isAuthenticated, router])

  const displayName =
    `${formData.firstName} ${formData.lastName}`.trim() || user?.fullName || "Admin User"
  const normalizedAvatar = resolveAvatarUrl(avatarPreview || avatarUrl)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", `${formData.firstName} ${formData.lastName}`.trim())
      if (formData.phone) {
        formDataToSend.append("phone", formData.phone)
      }
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile)
      }

      const updated = await profileApi.updateProfile(formDataToSend)
      setAvatarUrl(updated.avatarUrl || null)
      setAvatarPreview(null)
      setAvatarFile(null)
      
      if (user) {
        const updatedUser = { ...user, fullName: updated.fullName, avatarUrl: updated.avatarUrl }
        updateUser(updatedUser)
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">My Profile</h2>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-8 mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
          <div className="relative group">
            <UserAvatar
              name={displayName}
              avatarUrl={normalizedAvatar}
              className="h-24 w-24 border-2 border-primary text-4xl"
              fallbackClassName="text-4xl"
            />
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors cursor-pointer">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {formData.email}
            </p>
          </div>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={`${
              isEditing ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
            } text-white transition-colors`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-6 border-t border-border pt-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="border-t border-border pt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">First Name</p>
                <p className="font-medium">{formData.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Name</p>
                <p className="font-medium">{formData.lastName}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </p>
                <p className="font-medium">{formData.phone || "Not set"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

