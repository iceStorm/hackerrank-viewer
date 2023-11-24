"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import clsx from "clsx"
import { IoSearchOutline } from "react-icons/io5"

const formSchema = z.object({ username: z.string().min(1, "Please fill out the username") })

export function SearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({ mode: "all", resolver: zodResolver(formSchema) })

  const onSubmit = handleSubmit(formData => {
    //
  })

  return (
    <form className={clsx("flex flex-col", "w-full lg:w-96")} onSubmit={onSubmit}>
      <section className={clsx("flex justify-center items-center")}>
        <input
          type="text"
          autoComplete="username"
          autoFocus
          inputMode="search"
          placeholder="Enter your HackerRank username"
          className={clsx(
            "w-full",
            "border rounded-l-lg",
            "py-2 px-3",
            "text-sm",
            "border-2",
            "focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-offset-0",
            "hover:bg-gray-50",
          )}
          {...register("username")}
        />

        <button
          type="submit"
          className={clsx(
            "border-2 border-l-0 rounded-r-lg",
            "py-2 px-5",
            "w-fit",
            "flex items-center gap-2",
            "text-sm text-blue-500",
            "active:bg-gray-100",
          )}
        >
          <IoSearchOutline size={17} />
          <span>Search</span>
        </button>
      </section>

      <p className={clsx("text-red-500 text-xs mt-1 ml-3.5")}>{errors.username?.message ?? " "}</p>
    </form>
  )
}
