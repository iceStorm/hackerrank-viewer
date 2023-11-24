import Image from "next/image"

import { clsx } from "clsx"

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-10",
          "bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-50 backdrop-blur-md",
          "border-b dark:border-gray-700",
        )}
      >
        <nav className={clsx("container", "py-5")}>
          <a href="/" className="flex items-center gap-2">
            <Image src="/hackerrank-logo.png" alt="hackerrank_logo" width={20} height={20} />
            <span className="font-semibold text-sm">hackerrank.viewer</span>
          </a>

          <ul></ul>

          <div></div>
        </nav>
      </header>

      <main className={clsx("flex-1")}>{children}</main>

      <footer></footer>
    </>
  )
}
