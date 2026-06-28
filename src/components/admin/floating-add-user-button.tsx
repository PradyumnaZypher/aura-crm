'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import QuickAddUser from '@/components/admin/quick-add-user'
import { UserPlus } from 'lucide-react'

interface FloatingAddUserButtonProps {
  onSuccess?: () => void
}

export default function FloatingAddUserButton({ onSuccess }: FloatingAddUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    onSuccess?.()
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group"
        >
          <UserPlus className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
      
      <QuickAddUser 
        open={isOpen} 
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}