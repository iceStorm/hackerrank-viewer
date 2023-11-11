export async function GET(request: Request) {
  const searchParams = new URLSearchParams(new URL(request.url).search)

  console.log("url queries:", searchParams)

  const response = await fetch(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${searchParams.get(
      "username",
    )}`,
  )

  return Response.json(await response.json())
}
