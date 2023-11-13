export interface Cert {
  id: string
  type: string
  links: Links
  attributes: Attributes
}

export interface Links {
  self: string
}

export interface Attributes {
  status: "test_passed" | "test_failed"
  username: string
  unlock_date?: string
  waived_off: any
  certificate: Certificate
  certificates: string[]
  certificate_image?: string
  hacker_name: string
  test_unique_id: string
  kind: string
  hacker_name_updated_at: any
  seen_by_user: any
  completed_at: string
  score: number
  alloted_at?: string
  type: string
}

export interface Certificate {
  track_slug: string
  label: string
  level: string
  skill_unique_id: string
  description: string
}

import axios from "axios"
import AdmZip from "adm-zip"
import { format } from "date-fns"

export async function GET(req: Request, res: Response) {
  const searchParams = new URLSearchParams(new URL(req.url).search)
  const username = searchParams.get("username")

  const response = await fetch(
    `https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${username}`,
  )

  const certs: Cert[] = (await response.json()).data

  const certImage = await Promise.all(
    certs
      .filter(cert => cert.attributes.status === "test_passed")
      .map(async cert => {
        const image = await axios.get(cert.attributes.certificate_image!, {
          responseType: "arraybuffer",
        })
        return image.data
      }),
  )

  const zipper = new AdmZip()

  certImage.forEach((imageStream, index) => {
    zipper.addFile(
      `${certs[index].id}__${certs[index].attributes.certificates[0]}.jpg`,
      Buffer.from(imageStream),
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
