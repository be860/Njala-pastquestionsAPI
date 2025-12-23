"use client"

import { useState } from "react"
import { Bell, Lock, ToggleRight, ToggleLeft, Download, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    darkMode: false,
    publicProfile: true,
    dataAnalytics: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const settingGroups = [
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        {
          key: "emailNotifications",
          label: "Email Notifications",
          description: "Receive email updates about your progress and new content",
        },
        {
          key: "pushNotifications",
          label: "Push Notifications",
          description: "Get push notifications on your devices",
        },
        {
          key: "weeklyReport",
          label: "Weekly Report",
          description: "Receive a summary of your learning activity every week",
        },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Lock,
      settings: [
        {
          key: "publicProfile",
          label: "Public Profile",
          description: "Allow other students to view your profile",
        },
        {
          key: "dataAnalytics",
          label: "Analytics Tracking",
          description: "Help us improve by sharing anonymous usage data",
        },
      ],
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Setting Groups */}
      <div className="space-y-6">
        {settingGroups.map((group, index) => {
          const Icon = group.icon
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Group Header */}
              <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">{group.title}</h3>
              </div>

              {/* Settings */}
              <div className="divide-y divide-border">
                {group.settings.map((setting, settingIndex) => (
                  <div
                    key={settingIndex}
                    className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(setting.key as keyof typeof settings)}
                      className="ml-4 flex-shrink-0 transition-colors"
                    >
                      {settings[setting.key as keyof typeof settings] ? (
                        <ToggleRight className="w-6 h-6 text-primary" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Data Management */}
      <div
        className="bg-card border border-border rounded-lg p-6 mt-8 animate-slide-up"
        style={{ animationDelay: "150ms" }}
      >
        <h3 className="text-lg font-bold mb-6">Data Management</h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors border border-border">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Download My Data</p>
                <p className="text-sm text-muted-foreground">Export all your data in JSON format</p>
              </div>
            </div>
            <span className="text-primary font-medium">Export</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-red-500/80">Permanently delete your account and all data</p>
              </div>
            </div>
            <span className="text-red-600 font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* Save Info */}
      <div
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 animate-slide-up"
        style={{ animationDelay: "200ms" }}
      >
        <p className="text-sm text-blue-900">
          Your settings are saved automatically when you toggle options. Changes take effect immediately.
        </p>
      </div>
    </div>
  )
}
