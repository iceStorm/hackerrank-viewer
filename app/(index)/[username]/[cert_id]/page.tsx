import { PageProps } from "@/app/_models/PageProps"

import clsx from "clsx"

import { IoImageOutline } from "react-icons/io5"
import { PiFilePdf } from "react-icons/pi"

import { getCerts, getProfile } from "@/app/_utils/hackerrank-api"
import { Button } from "@/components/ui/button"

import { CertCanvas, CertCanvasRef } from "./CertCanvas"
import { differenceInMinutes, format } from "date-fns"

type Props = PageProps<{ cert_id: string; username: string }>

export default async function CertificatePage({ params, searchParams }: Props) {
  const certificateId = params.cert_id

  const [certs, profile] = await Promise.all([getCerts(params.username), getProfile(params.username)])
  const theCert = certs.data.find(cert => cert.id === certificateId)

  if (!theCert) {
    return (
      <div className="container py-5">
        Certificate <em>&quot;{params.cert_id}&quot;</em> not found for user <em>{params.username}</em>.
      </div>
    )
  }

  return (
    <div className={clsx("container py-10", "flex flex-col gap-10")}>
      <section>
        <h2 className="uppercase text-xs font-light mb-2">{params.username}</h2>
        <h1 className="text-2xl font-semibold">
          {theCert.attributes.certificate.label}{" "}
          {theCert.attributes.certificate.level && `(${theCert.attributes.certificate.level})`} Certificate
        </h1>
      </section>

      <section className={clsx("flex gap-10")}>
        <div className={clsx("flex-[1.618]")}>
          <CertCanvas cert={theCert} userProfile={profile.model} />
        </div>

        <aside className={clsx("flex-[1]", "flex flex-col gap-5")}>
          <div>
            <p className="font-bold">Certificate ID</p>
            <span className="font-light uppercase">{theCert.id}</span>
          </div>

          <div>
            <p className="font-bold">Certificate name</p>
            <p className="font-light capitalize">
              {theCert.attributes.certificate.label}
              {theCert.attributes.certificate.level.length ? ` (${theCert.attributes.certificate.level})` : ""}
            </p>
          </div>

          <div>
            <p className="font-bold">Level</p>
            <span className="font-light capitalize">
              {theCert.attributes.certificate.level.length
                ? theCert.attributes.certificate.level
                : theCert.attributes.type}
            </span>
          </div>

          <div>
            <p className="font-bold">Description</p>
            <span className="font-light">{theCert.attributes.certificate.description}</span>
          </div>

          <div className="flex items-center gap-10">
            <div>
              <p className="font-bold">Completed at</p>
              <p className="font-light">{format(new Date(theCert.attributes.completed_at), "dd MMMM yyyy")}</p>
            </div>

            <div>
              <p className="font-bold">Scores</p>
              <p className="font-light">{theCert.attributes.score}</p>
            </div>
          </div>

          <div>
            <p className="font-bold mb-1">Download</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className={clsx(
                  "bg-white dark:bg-stone-900 dark:border dark:border-stone-700 dark:hover:bg-stone-700",
                  "flex items-center gap-2",
                )}
              >
                <IoImageOutline size={17} />
                <span className="text-sm">PNG</span>
              </Button>

              <Button
                variant="outline"
                className={clsx(
                  "bg-white dark:bg-stone-900 dark:border dark:border-stone-700 dark:hover:bg-stone-700",
                  "flex items-center gap-2",
                )}
              >
                <PiFilePdf size={17} />
                <span className="text-sm">PDF</span>
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
