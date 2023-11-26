import axios from "axios"
import AdmZip from "adm-zip"
import { format } from "date-fns"

import { Cert } from "@/app/_models/Cert"

export async function GET(req: Request, res: Response) {
  const searchParams = new URLSearchParams(new URL(req.url).search)
  const username = searchParams.get("username")

  const response = await axios.get<{ data: Cert[] }>(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${username}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    },
  )

  const passedCerts = response.data.data.filter(cert => cert.attributes.status === "test_passed")

  if (!passedCerts.length) {
    return Response.json({
      username,
      message:
        "There is no data to download. You have typed the wrong HackerRank username, or your account does not contain any certificates.",
      profile: `https://www.hackerrank.com/profile/${username}`,
    })
  }

  const certImage = await Promise.all(
    passedCerts.map(async cert => {
      const { data: imageBuffer } = await axios.get<ArrayBuffer>(cert.attributes.certificate_image!, {
        responseType: "arraybuffer",
      })

      return imageBuffer
    }),
  )

  const zipper = new AdmZip()

  certImage.forEach((imageBuffer, index) => {
    zipper.addFile(
      `${passedCerts[index].id}__${passedCerts[index].attributes.certificates[0].replace(" ()", "")}.jpg`,
      Buffer.from(imageBuffer),
    )
  })

  return new Response(zipper.toBuffer(), {
    headers: {
      "content-type": "application/zip",
      "Content-Disposition": `attachment; filename="${username}_hackerrank_certificates__${format(
        new Date(),
        "dd.MM.yyyy",
      )}.zip"`,
    },
  })
}
