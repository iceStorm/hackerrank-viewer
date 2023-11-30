import AdmZip from "adm-zip"
import { format } from "date-fns"

import { getCertImage, getCerts } from "@/app/_utils/hackerrank-api"

export async function GET(req: Request, res: Response) {
  try {
    const searchParams = new URLSearchParams(new URL(req.url).search)
    const username = searchParams.get("username")

    const allCerts = await getCerts(username!)

    const passedCerts = allCerts.filter(cert => !!cert.attributes.certificate_image)

    // due to some unexpected reasons, some certs might be completed but the certificate_image is null
    // we need to inform the user about these certs in a text file
    const passedCertsWithoutImage = allCerts.filter(
      cert => cert.attributes.status === "test_passed" && !cert.attributes.certificate_image,
    )

    // no certificates available
    if (!passedCerts.length && !passedCertsWithoutImage.length) {
      return Response.json({
        username,
        message:
          "There is no data to download. You have typed the wrong HackerRank username, or your account does not contain any certificates.",
        profile: `https://www.hackerrank.com/profile/${username}`,
      })
    }

    // map all certificates image to buffer array
    const certImageBufferList = await Promise.all(
      passedCerts.map(async cert => {
        return getCertImage(cert.attributes.certificate_image!)
      }),
    )

    const zipper = new AdmZip()

    certImageBufferList.forEach((imageBuffer, index) => {
      zipper.addFile(
        `${passedCerts[index].id}__${passedCerts[index].attributes.certificates[0].replace(" ()", "")}.jpg`,
        Buffer.from(imageBuffer),
      )
    })

    // add the passed certs with no images reference link to a text file
    if (passedCertsWithoutImage.length) {
      const totalPassedCertCounts = allCerts.filter(cert => cert.attributes.status === "test_passed").length

      let textFileData = `You have total ${totalPassedCertCounts} certificates. But ${
        passedCertsWithoutImage.length
      } of them ${
        passedCertsWithoutImage.length === 1 ? "does" : "do"
      } not have image. Please access the official links below to download ${
        passedCertsWithoutImage.length === 1 ? "it" : "them"
      } manually.\n\n`

      passedCertsWithoutImage.forEach(cert => {
        textFileData += `${cert.attributes.certificates[0].split(" ()")[0]}\n`
        textFileData += `https://www.hackerrank.com/certificates/${cert.id}\n`

        textFileData += "\n"
      })

      zipper.addFile("__README__CERTIFICATES_WITHOUT_IMAGE.txt", Buffer.from(textFileData))
    }

    return new Response(zipper.toBuffer(), {
      headers: {
        "content-type": "application/zip",
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
