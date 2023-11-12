import axios, { AxiosInstance } from "axios"

import { JSDOM } from "jsdom"

import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"

// 5 minute for each serverless function execution duration
export const maxDuration = 300

export async function OPTIONS() {
  return Response.json([])
}

export async function POST(request: Request) {
  const { login, password } = await request.json()
  // console.log(username, password)

  const jar = new CookieJar()
  const client = wrapper(
    axios.create({
      jar,
      timeout: 60000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    }),
  )

  // to get hackerrank hidden tokens and session id
  const initialCsrfToken = await getInitialCsrfToken(client)
  console.log("initial csrf:", initialCsrfToken)

  const loginResponse = await client.post(
    "https://www.hackerrank.com/rest/auth/login",
    { login, password },
    {
      headers: { "X-Csrf-Token": initialCsrfToken },
    },
  )

  let username: string | undefined

  // only fetch profile when logged in successfully
  if (loginResponse.data.status === true) {
    const { data: profileData } = await client.get("https://www.hackerrank.com/prefetch_data")
    username = profileData.profile.username
    console.log("username:", username)
  }

  // if login failed, get certs by username
  const certsResponse = await client.get(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${username ?? login}`,
  )

  const responseObj = Object.assign(loginResponse.data, {
    username,
    certs: certsResponse.data.data,
  })

  return Response.json(responseObj)
}

async function getInitialCsrfToken(axiosClient: AxiosInstance) {
  const { data } = await axiosClient.get("https://hackerrank.com/dashboard")

  const page = new JSDOM(data)
  const metaTag = page.window.document.querySelector('meta[id="csrf-token"]')

  return metaTag?.getAttribute("content")
}

async function getCertsWithUsername(username: string) {
  const response = await fetch(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${username}`,
  )

  return response.json()
}
