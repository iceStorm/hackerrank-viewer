import { Cert } from "../_models/Cert"
import { Profile } from "../_models/Profile"
import { getHttpClient } from "./httpClient"

export async function getCerts(username: string) {
  const response = await getHttpClient().get<{ data: Cert[] }>(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${username}`,
  )

  return response.data
}

export async function getProfile(username: string) {
  const { data } = await getHttpClient().get<{ model: Profile }>(
    `https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`,
  )

  return data
}

export function getCertBackgroundName(cert: Cert) {
  const certName = cert.attributes.certificates[0].split(/\(Basic|\(Intermediate|\(Advanced/)[0].split("()")[0]

  const words = certName.split(" ").filter(Boolean)
  const transformedWords = new Array<string>()

  for (let index = 0; index < words.length; index++) {
    const word = words[index]

    switch (word) {
      case "C#":
        transformedWords.push("C%23")
        break

      case "Node":
      case "Node.js":
        transformedWords.push("Nodejs")
        break

      case "Rest":
        transformedWords.push("Rest_")
        break

      case "(React)":
        transformedWords.push("React")
        break

      case "Engineer":
        transformedWords.push(words[index + 1] === "Intern" ? "Engineering" : word)
        break

      default:
        transformedWords.push(word)
    }
  }

  return transformedWords.join("")
}
