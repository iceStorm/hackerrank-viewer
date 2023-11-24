import Image from "next/image"

import { clsx } from "clsx"
import { ThemeSwitch } from "../_components/ThemeSwitch"

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-10",
          "bg-white dark:bg-stone-800 bg-opacity-75 dark:bg-opacity-50 backdrop-blur-md",
          "border-b dark:border-stone-800",
        )}
      >
        <nav className={clsx("container", "py-3", "flex items-center justify-between")}>
          <a href="/" className="flex items-center gap-2">
            <Image src="/hackerrank-logo.png" alt="hackerrank_logo" width={20} height={20} />
            <span className="font-semibold text-sm">hackerrank.viewer</span>
          </a>

          <ul></ul>

          <div>
            <ThemeSwitch />
          </div>
        </nav>
      </header>

      <main className={clsx("flex-1")}>{children}</main>

      <footer></footer>
    </>
  )
}
