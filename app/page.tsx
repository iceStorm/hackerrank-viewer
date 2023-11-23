import Image from "next/image"

export default function Home() {
  const bodyText = `<>Hello World.</>`

  return (
    <div className="container h-screen flex flex-col justify-center items-center">
      <pre>{bodyText}</pre>
    </div>
  )
}
