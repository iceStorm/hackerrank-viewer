"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

import clsx from "clsx"
import { format } from "date-fns"

import { FiLink } from "react-icons/fi"
import { TbWorldShare } from "react-icons/tb"
import { LuCheckCircle } from "react-icons/lu"
import { IoImageOutline } from "react-icons/io5"
import { PiSealCheckDuotone, PiXCircleDuotone, PiWarningDuotone, PiFilePdf } from "react-icons/pi"
import { IoMdClose } from "react-icons/io"
import { IoCodeSlashOutline } from "react-icons/io5"
import { GoDownload } from "react-icons/go"

import { Button } from "@/components/ui/button"

import { Cert } from "@/app/_models/Cert"
import { getCertBackgroundName } from "@/app/_utils/hackerrank-api"

interface CertGridProps {
  certs: Cert[]
}

export function CertGrid({ certs }: CertGridProps) {
  const router = useRouter()
  const params = useParams()

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([])

  function handleCertSelect(certId: string) {
    if (selectedCertIds.includes(certId)) {
      setSelectedCertIds(prev => prev.filter(id => id !== certId))
    } else {
      setSelectedCertIds(prev => prev.concat(certId))
    }
  }

  return (
    <>
      <section className="flex items-center justify-between">
        <Button
          variant="outline"
          className="bg-white dark:bg-stone-900 dark:border dark:border-stone-700"
          onClick={() => setIsSelectionMode(prev => !prev)}
        >
          {isSelectionMode ? <IoMdClose size={20} /> : <LuCheckCircle size={15} />}

          <span className="ml-2">{isSelectionMode ? "Exit selection" : "Select"}</span>
        </Button>

        {isSelectionMode && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className={clsx("bg-white dark:bg-stone-900")}
                title="Download certificate image"
                disabled={selectedCertIds.length === 0}
              >
                <Button variant="outline">
                  <GoDownload size={20} />
                  <span className="ml-2">Download ({selectedCertIds.length} selected)</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>JPG (low quality, small size)</DropdownMenuItem>
                <DropdownMenuItem>PNG (high quality, medium size)</DropdownMenuItem>
                <DropdownMenuItem>PDF (best quality, large size)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </section>

      <section
        className={clsx("grid gap-10")}
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        }}
      >
        {certs.map(cert => {
          const badgeIcon =
            cert.attributes.status === "test_passed" ? (
              <PiSealCheckDuotone
                size={30}
                className={clsx("-ml-1", {
                  "text-blue-600 dark:text-blue-500": cert.attributes.type === "role",

                  "text-green-600": cert.attributes.type === "skill" && cert.attributes.certificate.level === "Basic",
                  "text-amber-600":
                    cert.attributes.type === "skill" && cert.attributes.certificate.level === "Intermediate",
                  "text-violet-600 dark:text-violet-500":
                    cert.attributes.type === "skill" && cert.attributes.certificate.level === "Advanced",
                })}
              />
            ) : cert.attributes.status === "test_failed" ? (
              <PiXCircleDuotone size={30} className={clsx("text-gray-500 dark:text-gray-400 -ml-1")} />
            ) : (
              <PiWarningDuotone size={30} className={clsx("text-cyan-500")} />
            )

          return (
            <div
              key={cert.id}
              className={clsx(
                "bg-white dark:bg-stone-900 border dark:border-stone-700 dark:border-opacity-75 rounded-md",
                "relative",
                "p-5",
                "flex flex-col justify-between",
              )}
            >
              {isSelectionMode && cert.attributes.status === "test_passed" && (
                <>
                  <div className="checkbox absolute z-20 -top-3 left-1/2 -translate-x-1/2">
                    <input
                      type="checkbox"
                      id={cert.id}
                      checked={selectedCertIds.includes(cert.id)}
                      onChange={() => handleCertSelect(cert.id)}
                    />
                    <label htmlFor={cert.id}></label>
                  </div>

                  <div
                    className={clsx(
                      "absolute z-10 top-0 left-0 right-0 bottom-0",
                      "hover:bg-gray-100 hover:bg-opacity-30 dark:hover:bg-black dark:hover:bg-opacity-20",
                      "cursor-pointer",
                      "rounded-md",
                    )}
                    onClick={() => handleCertSelect(cert.id)}
                  ></div>
                </>
              )}

              <div
                className={clsx("flex flex-col justify-between h-full", {
                  "opacity-50 pointer-events-none select-none": isSelectionMode,
                })}
              >
                <section>
                  <div className="flex items-center" style={{ height: 30 }}>
                    {badgeIcon}
                  </div>

                  <div
                    title="Certificate level"
                    className={clsx("ribbon", "text-[10px] font-semibold uppercase py-2 dark:text-gray-50", {
                      "bg-green-300 dark:bg-green-700 text-green-700":
                        cert.attributes.status === "test_passed" &&
                        cert.attributes.type === "skill" &&
                        cert.attributes.certificate.level === "Basic",
                      "bg-amber-200 dark:bg-amber-700 text-amber-800":
                        cert.attributes.status === "test_passed" &&
                        cert.attributes.type === "skill" &&
                        cert.attributes.certificate.level === "Intermediate",
                      "bg-violet-200 dark:bg-violet-700 text-violet-700":
                        cert.attributes.status === "test_passed" &&
                        cert.attributes.type === "skill" &&
                        cert.attributes.certificate.level === "Advanced",

                      "bg-blue-200 dark:bg-blue-700 text-blue-700":
                        cert.attributes.status === "test_passed" && cert.attributes.type === "role",

                      "bg-gray-200 dark:bg-gray-600 text-gray-700": cert.attributes.status === "test_failed",

                      "bg-cyan-200 dark:bg-cyan-700 text-cyan-700":
                        cert.attributes.status === "retake_available" || cert.attributes.status === "started",
                    })}
                  >
                    {cert.attributes.certificate.level.length
                      ? cert.attributes.certificate.level
                      : cert.attributes.type}
                  </div>

                  <section className="mt-5">
                    <p
                      className={clsx("font-semibold", {
                        "text-blue-600 dark:text-blue-500":
                          cert.attributes.status === "test_passed" && cert.attributes.type === "role",

                        "text-green-600":
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "skill" &&
                          cert.attributes.certificate.level === "Basic",
                        "text-amber-600":
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "skill" &&
                          cert.attributes.certificate.level === "Intermediate",
                        "text-violet-600 dark:text-violet-500":
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "skill" &&
                          cert.attributes.certificate.level === "Advanced",

                        "text-gray-600 dark:text-gray-400": cert.attributes.status === "test_failed",

                        "text-cyan-500 dark:text-cyan-500": cert.attributes.status === "retake_available",
                      })}
                    >
                      {cert.attributes.certificate.label}
                    </p>

                    <div
                      className={clsx("flex items-center text-[10px] gap-2 mt-2", "text-stone-500 dark:text-stone-400")}
                    >
                      <span
                        title="Completed date"
                        className={clsx(
                          "uppercase font-medium",
                          "border dark:border-stone-600 rounded-sm",
                          "px-3 py-1",
                        )}
                      >
                        {format(new Date(cert.attributes.completed_at), "dd-MM-yyyy")}
                      </span>

                      <span
                        title="Scores"
                        className={clsx(
                          "uppercase font-medium",
                          "border dark:border-stone-600 rounded-sm",
                          "px-3 py-1",
                        )}
                      >
                        {cert.attributes.score ?? "?"}
                      </span>

                      <span
                        title="Certificate genre"
                        className={clsx(
                          "capitalize font-medium text-[10px]",
                          "border dark:border-stone-600 rounded-sm",
                          "px-3 py-1",
                        )}
                      >
                        {cert.attributes.type}
                      </span>
                    </div>

                    <p className={clsx("text-xs font-light opacity-50", "mt-5")}>
                      {cert.attributes.certificate.description}
                    </p>
                  </section>
                </section>

                <Image
                  alt="cert background"
                  width={50}
                  height={50}
                  src={`https://hrcdn.net/s3_pub/hr-assets/dashboard/${getCertBackgroundName(cert)}.svg`}
                  className={clsx("absolute bottom-2 right-3", "grayscale opacity-20")}
                />

                <section className={clsx("mt-10")}>
                  {cert.attributes.status === "test_passed" && (
                    <div className="flex items-center gap-5">
                      <div
                        className={clsx("flex items-center gap-5 lg:gap-2", {
                          "opacity-0": isSelectionMode,
                        })}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="opacity-50 hover:opacity-100"
                            title="Download certificate image"
                          >
                            <IoImageOutline size={20} />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent>
                            <DropdownMenuItem>JPG (low quality, small size)</DropdownMenuItem>
                            <DropdownMenuItem>PNG (high quality, large size)</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <button className="opacity-50 hover:opacity-100" title="Download certificate pdf">
                          <PiFilePdf size={20} />
                        </button>

                        <a
                          className="opacity-50 hover:opacity-100"
                          title="View original certificate page"
                          href={`https://www.hackerrank.com/certificates/${cert.id}`}
                          target="_blank"
                        >
                          <TbWorldShare size={20} />
                        </a>

                        <button className="opacity-50 hover:opacity-100" title="Copy certificate url">
                          <FiLink size={17} />
                        </button>

                        <button className="opacity-50 hover:opacity-100" title="Copy iframe code">
                          <IoCodeSlashOutline size={20} />
                        </button>
                      </div>

                      <div>
                        <Link
                          href={`/${params.username}/${cert.id}`}
                          className={clsx(
                            "text-[10px] uppercase font-medium",
                            "rounded-full",
                            "border dark:border-stone-700",
                            "py-1 px-3",
                            "hover:bg-stone-200 dark:hover:bg-stone-800",
                          )}
                          onClick={() => router.push("./" + cert.id)}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  )}

                  {cert.attributes.status === "test_failed" && (
                    <span
                      className={clsx(
                        "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white",
                        "border border-gray-400 dark:border-gray-500",
                        "rounded-full",
                        "text-xs",
                        "px-5 py-1",
                      )}
                    >
                      Test failed
                    </span>
                  )}

                  {cert.attributes.status === "started" && (
                    <span
                      className={clsx(
                        "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white",
                        "rounded-full",
                        "text-xs",
                        "px-5 py-1",
                      )}
                    >
                      Verifying
                    </span>
                  )}

                  {cert.attributes.status === "retake_available" && (
                    <span
                      className={clsx(
                        "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-white",
                        "border border-cyan-500 dark:border-cyan-600",
                        "rounded-full",
                        "text-xs",
                        "px-5 py-1",
                      )}
                    >
                      Retake available
                    </span>
                  )}
                </section>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
