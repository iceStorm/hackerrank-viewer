import { AxiosError } from "axios"

import Image from "next/image"
import clsx from "clsx"
import { format } from "date-fns"

import { FaAward } from "react-icons/fa"
import { IoImageOutline } from "react-icons/io5"
import { PiFilePdf } from "react-icons/pi"
import { RiProhibitedLine } from "react-icons/ri"
import { TbWorldShare } from "react-icons/tb"
import { FaCode } from "react-icons/fa6"
import { FiLink } from "react-icons/fi"
import { PiWarningFill } from "react-icons/pi"
import { PiTrophyDuotone } from "react-icons/pi"
import { PiWarningDuotone } from "react-icons/pi"
import { PiXCircleDuotone } from "react-icons/pi"
import { PiShieldCheckDuotone } from "react-icons/pi"
import { PiSealCheckDuotone } from "react-icons/pi"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getCertBackgroundName, getCerts, getProfile } from "../../_utils/hackerrank-api"

import { PageProps } from "../../_models/PageProps"
import { Cert } from "../../_models/Cert"
import { Profile } from "../../_models/Profile"

import "./certificate.scss"

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const username = params.slug

  let response: { certs: Cert[]; profile: Profile } = {} as never

  try {
    const [certs, profile] = await Promise.all([getCerts(username), getProfile(username)])

    certs.data
      .sort((a, b) => a.attributes.certificates[0].localeCompare(b.attributes.certificates[0]))
      .sort((a, b) => a.attributes.type.localeCompare(b.attributes.type))

    Object.assign(response, {
      certs: certs.data,
      profile: profile.model,
    })
  } catch (error) {
    const axiosError = error as AxiosError
    // console.log("errors:", axiosError)

    if (axiosError.response?.status === 404) {
      return <div>username not found.</div>
    }

    return <div>{axiosError.message}</div>
  }

  const isUserAvatarAvailabel =
    response.profile?.avatar && !response.profile.avatar.endsWith("gravatar.jpg")

  return (
    <div className="min-h-screen">
      <div className={clsx("container flex flex-col gap-10", "py-10")}>
        <section
          className={clsx(
            "w-full md:w-fit mx-auto",
            "flex flex-col gap-10",
            "bg-white dark:bg-stone-900",
            "rounded-lg",
            "border",
            "p-5",
          )}
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <Image
                src={
                  isUserAvatarAvailabel
                    ? response.profile?.avatar
                    : "https://hrcdn.net/fcore/assets/profile/default_avatar_bg-fba6466c4f.png"
                }
                alt="user_avatar"
                width={100}
                height={100}
                className={clsx(
                  "rounded-full border-4 border-white dark:border-gray-700 shadow-xl",
                )}
              />

              {!isUserAvatarAvailabel && (
                <span
                  className={clsx(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "text-white font-bold",
                  )}
                >
                  {response.profile.personal_first_name?.[0]}
                  {response.profile.personal_last_name?.[0]}
                </span>
              )}
            </div>

            <h1 title="Full name" className={clsx("font-semibold", "my-1 mt-3")}>
              {response.profile.name}
            </h1>

            <h2
              title="username"
              className={clsx(
                "bg-lime-50 dark:bg-lime-900 border-[1.5px] border-lime-500",
                "text-lime-700 dark:text-lime-50",
                "rounded-full",
                "px-5 py-0.5",
                "text-xs font-medium",
              )}
            >
              {response.profile.username}
            </h2>
          </div>

          <div
            className={clsx(
              "flex items-center lg:justify-center flex-wrap",
              "gap-10 lg:gap-0",
              "lg:divide-x lg:dark:divide-stone-700",
              "text-xs lg:text-sm",
            )}
          >
            <div className="lg:px-10">
              <p className="font-extralight">Joined</p>
              <p className={clsx("font-semibold")}>
                {format(new Date(response.profile.created_at), "dd-MM-yyyy")}
              </p>
            </div>

            <div className="lg:px-10">
              <p className="font-extralight">Job title</p>
              <p className={clsx("font-semibold")}>{response.profile.jobs_headline}</p>
            </div>

            <div className="lg:px-10">
              <p className="font-extralight">Certificates</p>
              <p className={clsx("font-semibold")}>{response.certs.length}</p>
            </div>

            <div className="lg:px-10">
              <p className="font-extralight">Total certificates score</p>
              <p className={clsx("font-semibold")}>
                {response.certs.reduce((prev, current) => prev + current.attributes.score, 0)}
              </p>
            </div>
          </div>
        </section>

        <section
          className={clsx("grid gap-10")}
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          }}
        >
          {response.certs.map(cert => {
            const badgeIcon =
              cert.attributes.status === "test_passed" ? (
                <PiSealCheckDuotone
                  size={30}
                  className={clsx("-ml-1", {
                    "text-blue-600 dark:text-blue-500": cert.attributes.type === "role",

                    "text-green-600":
                      cert.attributes.type === "skill" &&
                      cert.attributes.certificate.level === "Basic",
                    "text-amber-600":
                      cert.attributes.type === "skill" &&
                      cert.attributes.certificate.level === "Intermediate",
                    "text-violet-600 dark:text-violet-500":
                      cert.attributes.type === "skill" &&
                      cert.attributes.certificate.level === "Advanced",
                  })}
                />
              ) : cert.attributes.status === "test_failed" ? (
                <PiXCircleDuotone size={30} className={clsx("text-rose-500 -ml-1")} />
              ) : (
                <PiWarningDuotone size={30} className={clsx("text-gray-500")} />
              )

            const statusText =
              cert.attributes.status === "test_passed"
                ? "Verified"
                : cert.attributes.status === "test_failed"
                ? "Test failed"
                : "Retake available"

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
                <section>
                  <div className="flex items-center" style={{ height: 30 }}>
                    {badgeIcon}
                  </div>

                  <div
                    title="Certificate level"
                    className={clsx(
                      "ribbon",
                      "text-[10px] font-semibold uppercase py-2 dark:text-gray-50",
                      {
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
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "role",

                        "bg-rose-200 dark:bg-rose-700 text-rose-700":
                          cert.attributes.status === "test_failed",

                        "bg-gray-200 dark:bg-gray-700 text-gray-700":
                          cert.attributes.status === "retake_available",
                      },
                    )}
                  >
                    {cert.attributes.certificate.level.length
                      ? cert.attributes.certificate.level
                      : cert.attributes.type}
                  </div>

                  <section className="mt-5">
                    <p
                      className={clsx("font-semibold", {
                        "text-blue-600 dark:text-blue-500":
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "role",

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

                        "text-rose-600": cert.attributes.status === "test_failed",

                        "text-gray-600 dark:text-gray-400":
                          cert.attributes.status === "retake_available",
                      })}
                    >
                      {cert.attributes.certificate.label}
                    </p>

                    <div
                      className={clsx(
                        "flex items-center text-[10px] gap-2 mt-2",
                        "text-stone-500 dark:text-stone-400",
                      )}
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
                        {cert.attributes.score}
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

                    <p className={clsx("text-xs opacity-50", "mt-5")}>
                      {cert.attributes.certificate.description}
                    </p>
                  </section>
                </section>

                <Image
                  alt="cert background"
                  width={50}
                  height={50}
                  src={`https://hrcdn.net/s3_pub/hr-assets/dashboard/${getCertBackgroundName(
                    cert,
                  )}.svg`}
                  className={clsx("absolute bottom-2 right-3", "grayscale opacity-20")}
                />

                <section className={clsx("flex items-center gap-5 lg:gap-2 mt-10")}>
                  {cert.attributes.status === "test_passed" && (
                    <>
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

                      <button
                        className="opacity-50 hover:opacity-100"
                        title="Download certificate pdf"
                      >
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
                        <FaCode size={20} />
                      </button>
                    </>
                  )}

                  {cert.attributes.status === "test_failed" && (
                    <span
                      className={clsx(
                        "bg-rose-100 dark:bg-rose-700 text-rose-700 dark:text-white",
                        "rounded-full",
                        "text-xs",
                        "px-5 py-1",
                      )}
                    >
                      Test failed
                    </span>
                  )}

                  {cert.attributes.status === "retake_available" && (
                    <span
                      className={clsx(
                        "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white",
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
            )
          })}
        </section>
      </div>
    </div>
  )
}
