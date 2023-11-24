import { AxiosError } from "axios"

import Image from "next/image"
import clsx from "clsx"

import { FaAward } from "react-icons/fa"
import { LiaAwardSolid } from "react-icons/lia"
import { TbAwardOff } from "react-icons/tb"
import { PiSealWarningLight } from "react-icons/pi"
import { IoImageOutline } from "react-icons/io5"
import { PiFilePdf } from "react-icons/pi"
import { IoIosRibbon } from "react-icons/io"
import { RiProhibitedLine } from "react-icons/ri"
import { FaRegEye } from "react-icons/fa6"
import { TbWorldShare } from "react-icons/tb"
import { IoLink } from "react-icons/io5"
import { FaCode } from "react-icons/fa6"
import { FiLink } from "react-icons/fi"

import { getCertBackgroundName, getCerts, getProfile } from "../(utils)/hackerrank-api"

import { PageProps } from "../models/PageProps"
import { Cert } from "../models/Cert"
import { Profile } from "../models/Profile"

import "./certificate.scss"
import { format } from "date-fns"

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
    <div className="bg-gray-50 min-h-screen">
      <div className={clsx("container flex flex-col gap-10", "py-10")}>
        <section className={clsx("flex flex-col items-center")}>
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
              className={clsx("rounded-full border-4 border-white shadow-xl")}
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
              "bg-lime-50 border-[1.5px] border-lime-500",
              "text-lime-700",
              "rounded-full",
              "px-5 py-0.5",
              "text-xs",
            )}
          >
            {response.profile.username}
          </h2>
        </section>

        <section className={clsx("bg-white")}>
          <div></div>

          <div></div>

          <div></div>
        </section>

        <section
          className={clsx("grid gap-10")}
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {response.certs.map(cert => {
            const badgeIcon =
              cert.attributes.status === "test_passed" ? (
                <FaAward
                  size={30}
                  className={clsx({
                    "text-green-600": cert.attributes.type === "skill",

                    "text-blue-600": cert.attributes.type === "role",
                  })}
                />
              ) : cert.attributes.status === "test_failed" ? (
                <RiProhibitedLine size={30} className={clsx("text-red-500")} />
              ) : null // retake available

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
                  "bg-white border rounded-md",
                  "relative",
                  "p-5",
                  "flex flex-col justify-between",
                )}
              >
                <section>
                  <div className="flex items-center" style={{ height: 30 }}>
                    {badgeIcon}

                    {cert.attributes.status === "retake_available" && (
                      <span className={clsx("text-xs")}>
                        Last attemp: {format(new Date(cert.attributes.completed_at), "dd-MM-yyyy")}
                      </span>
                    )}
                  </div>

                  <div
                    title="Scores"
                    className={clsx("ribbon", "text-sm font-bold py-2", {
                      "bg-green-200 text-green-700":
                        cert.attributes.status === "test_passed" &&
                        cert.attributes.type === "skill",

                      "bg-blue-200 text-blue-700":
                        cert.attributes.status === "test_passed" && cert.attributes.type === "role",

                      "bg-rose-200 text-rose-700": cert.attributes.status === "test_failed",

                      "bg-amber-200 text-amber-700": cert.attributes.status === "retake_available",
                    })}
                  >
                    {cert.attributes.score}
                  </div>

                  <section className="mt-5">
                    <p
                      className={clsx("font-semibold", {
                        "bg-gradient-to-r from-blue-600 to-blue-200 text-transparent bg-clip-text":
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "role",

                        "bg-gradient-to-r from-green-600 to-green-200 text-transparent bg-clip-text":
                          cert.attributes.status === "test_passed" &&
                          cert.attributes.type === "skill",

                        "bg-gradient-to-r from-red-600 to-red-300 text-transparent bg-clip-text inline-block":
                          cert.attributes.status === "test_failed",

                        "bg-gradient-to-r from-amber-600 to-amber-200 text-transparent bg-clip-text":
                          cert.attributes.status === "retake_available",
                      })}
                    >
                      {cert.attributes.certificates[0].replace(" ()", "")}
                    </p>

                    <div className="flex items-center text-[10px] gap-5">
                      <span className="uppercase font-normal">{cert.attributes.type}</span>
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
                  className={clsx("absolute bottom-2 right-3", "grayscale opacity-50")}
                />

                <section className={clsx("flex items-center gap-5 lg:gap-2 mt-10")}>
                  {cert.attributes.status === "test_passed" && (
                    <>
                      <button
                        className="opacity-50 hover:opacity-100"
                        title="Download certificate image"
                      >
                        <IoImageOutline size={20} />
                      </button>

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
                        "bg-rose-100 text-rose-700",
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
                        "bg-amber-200 text-amber-700",
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
