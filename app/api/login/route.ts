import { AxiosInstance } from "axios"

import { JSDOM } from "jsdom"

import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"
import { Cert } from "@/app/models/Cert"
import { getHttpClient } from "@/app/(utils)/httpClient"

// 5 minute for each serverless function execution duration
export const maxDuration = 300

export async function OPTIONS() {
  return Response.json([])
}

export async function POST(request: Request) {
  const { login, password } = await request.json()

  const jar = new CookieJar()
  const client = wrapper(getHttpClient({ jar }))

  // to get hackerrank hidden tokens and session id
  const initialCsrfToken = await getInitialCsrfToken(client)

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
  const certsResponse = await client.get<{ data: Cert[] }>(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${
      username ?? login
    }`,
  )

  const passedCertNames = certsResponse.data.data
    .filter(cert => cert.attributes.status === "test_passed")
    .map(cert => cert.attributes.certificates[0])

  const failedCertNames = certsResponse.data.data
    .filter(cert => cert.attributes.status === "test_failed")
    .map(cert => cert.attributes.certificates[0])

  const responseObj = Object.assign(loginResponse.data, {
    username,
    passedCertNames,
    failedCertNames,
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
