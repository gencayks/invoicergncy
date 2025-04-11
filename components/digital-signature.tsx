"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

interface DigitalSignatureProps {
  onSignatureChange: (signatureDataUrl: string | null) => void
  initialSignature?: string | null
}

export default function DigitalSignature({ onSignatureChange, initialSignature = null }: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!initialSignature)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  // Initialize canvas and load initial signature if provided
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    setCtx(context)
    context.lineWidth = 2
    context.lineCap = "round"
    context.strokeStyle = "#000000"

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image()
      img.onload = () => {
        context.drawImage(img, 0, 0)
        setHasSignature(true)
      }
      img.src = initialSignature
    }
  }, [initialSignature])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return

    setIsDrawing(true)

    // Get canvas position
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    // Handle mouse or touch event
    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return

    // Get canvas position
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    // Handle mouse or touch event
    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY

      // Prevent scrolling while drawing
      e.preventDefault()
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()

    setHasSignature(true)
  }

  const endDrawing = () => {
    if (!isDrawing || !ctx) return

    ctx.closePath()
    setIsDrawing(false)

    // Save signature
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      onSignatureChange(dataUrl)
    }
  }

  const clearSignature = () => {
    if (!ctx) return

    const canvas = canvasRef.current
    if (!canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Digital Signature</Label>
        {hasSignature && (
          <Button variant="ghost" size="sm" onClick={clearSignature} className="h-8 px-2 text-gray-500">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="border rounded-md p-1">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full touch-none bg-white border border-dashed border-gray-300 rounded"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>

      <p className="text-xs text-gray-500">Sign above using your mouse or touch screen</p>
    </div>
  )
}
