import { AxiosError } from "axios"

import Image from "next/image"
import clsx from "clsx"
import { format } from "date-fns"

import { getCerts, getProfile } from "../../_utils/hackerrank-api"

import { PageProps } from "../../_models/PageProps"
import { Cert } from "../../_models/Cert"
import { Profile } from "../../_models/Profile"

import { CertGrid } from "./CertGrid"
import "./certificate.scss"
import "./checkbox.scss"

export default async function ProfilePage({ params, searchParams }: PageProps<{ username: string }>) {
  const username = params.username

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
      return <div className="container pt-5">username not found.</div>
    }

    return <div>{axiosError.message}</div>
  }

  const isUserAvatarAvailabel = response.profile?.avatar && !response.profile.avatar.endsWith("gravatar.jpg")

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
            "p-5 mb-10",
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
                  "rounded-full border-[3px] border-white ring-4 ring-green-500 dark:border-gray-800 shadow-xl",
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
              <p className={clsx("font-semibold")}>{format(new Date(response.profile.created_at), "dd-MM-yyyy")}</p>
            </div>

            <div className="lg:px-10">
              <p className="font-extralight">Job title</p>
              <p className={clsx("font-semibold")}>{response.profile.jobs_headline}</p>
            </div>

            <div className="lg:px-10">
              <p className="font-extralight">Certificates</p>
              <p className={clsx("font-semibold")}>
                {response.certs.filter(cert => cert.attributes.status === "test_passed").length}
              </p>
            </div>

            <div className="lg:px-10">
              <p className="font-extralight">Total certificates score</p>
              <p className={clsx("font-semibold")}>
                {response.certs.reduce((prev, current) => prev + current.attributes.score, 0)}
              </p>
            </div>
          </div>
        </section>

        <CertGrid certs={response.certs} />
      </div>
    </div>
  )
}
