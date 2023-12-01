import Jimp from "jimp"
import AdmZip from "adm-zip"
import { format } from "date-fns"

import { generateImageBuffer, getCerts } from "@/app/_utils/hackerrank-api"

export async function GET(req: Request, res: Response) {
  try {
    const searchParams = new URLSearchParams(new URL(req.url).search)

    const username = searchParams.get("username")
    const certId = searchParams.get("cert")
    const quality = parseInt(searchParams.get("quality") ?? "50", 10)

    const allCerts = await getCerts(username!)
    const passedCerts = allCerts.filter(cert => cert.attributes.status === "test_passed")

    if (!username) {
      throw new Error("The 'username' query parameter is required in the url")
    }

    // no certificates available
    if (!passedCerts.length) {
      return Response.json({
        username,
        message:
          "There is no data to download. You have typed the wrong HackerRank username, or your account does not contain any certificates.",
        profile: `https://www.hackerrank.com/profile/${username}`,
      })
    }

    // handle single cert downloading
    if (certId) {
      const foundCert = passedCerts.find(cert => cert.id === certId)

      if (!foundCert) {
        throw new Error(`No certificate with id ${certId} available for user ${username}`)
      }

      return new Response(await generateImageBuffer(foundCert, quality), {
        headers: {
          "Content-Type": Jimp.MIME_JPEG,
          "Content-Disposition": `attachment; filename="${username}_hackerrank_certificate__${foundCert.attributes.certificates[0].replace(
            " ()",
            "",
          )}.jpg"`,
        },
      })
    }

    const zipper = new AdmZip()

    // map all certificates image to buffer array
    await Promise.all(
      passedCerts.map(cert =>
        generateImageBuffer(cert, quality).then(imageBuffer => {
          zipper.addFile(`${cert.id}__${cert.attributes.certificates[0].replace(" ()", "")}.jpg`, imageBuffer)
        }),
      ),
    )

    return new Response(zipper.toBuffer(), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${username}_hackerrank_certificates__${format(
          new Date(),
          "dd.MM.yyyy",
        )}.zip"`,
      },
    })
  } catch (error: any) {
    return Response.json(error.message)
  }
}
