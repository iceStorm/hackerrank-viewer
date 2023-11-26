"use client"

import { Cert } from "@/app/_models/Cert"
import { Profile } from "@/app/_models/Profile"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

interface CertCanvasProps {
  userProfile: Profile
  cert: Cert
}

export interface CertCanvasRef {
  downloadPdf(): void
  downloadPng(): void
}

export const CertCanvas = forwardRef<CertCanvasRef, CertCanvasProps>(function CertCanvas({ cert, userProfile }, ref) {
  const [isCanvasReady, setIsCanvasReady] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    downloadPdf() {
      //
    },
    downloadPng() {
      //
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) {
      return
    }

    const certTemplateImage = new Image(1200, 1600)
    certTemplateImage.src = "https://hrcdn.net/fcore/assets/certificate/certificate_template-9336f189bc.jpg"

    certTemplateImage.onload = () => {
      ctx.drawImage(certTemplateImage, 0, 0, canvas?.width ?? 0, canvas?.height ?? 0)

      setIsCanvasReady(true)

      const getCenterCoordinate = (str: string) => {
        const textWidth = ctx.measureText(str).width
        return (canvas.width - textWidth) / 2
      }

      // Set font properties
      ctx.fillStyle = "#0E141E"
      ctx.font = "bold 72px Arial"

      // Calculate the center coordinates
      const userName = `${userProfile.personal_first_name.trim()} ${userProfile.personal_last_name.trim()}`
      const xUserName = getCenterCoordinate(userName)
      const y = canvas.height / 2

      // Draw name in the center
      ctx.fillText(userName, xUserName, y - 10)

      // Draw the certificate name
      ctx.font = "bold 36px Arial"
      const certFullName =
        cert.attributes.certificate.label +
        (cert.attributes.certificate.level.length ? ` (${cert.attributes.certificate.level})` : "")

      const xCertName = getCenterCoordinate(certFullName)
      //   const xCertName = getCenterCoordinate(cert.attributes.certificate.label)
      ctx.fillText(certFullName, xCertName, y + 140)

      ctx.font = "normal 20px Arial"
      ctx.fillText(cert.id.toUpperCase(), canvas.width - 360, 155)

      // fill date
      ctx.font = "bold 30px Arial" // set font before mesuring
      const certCompletedDate = format(new Date(cert.attributes.completed_at), "dd MMM yyyy")
      const dateWidth = ctx.measureText(certCompletedDate).width

      const dateEndCoordinate = 590
      const xDate = dateEndCoordinate - dateWidth

      ctx.fillText(certCompletedDate, xDate, canvas.height - 230)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} height={1200} width={1600} className="w-full"></canvas>
})
