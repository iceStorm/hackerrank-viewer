import { PageProps } from "@/app/_models/PageProps"

export default async function CertificatePage({ params, searchParams }: PageProps<{ cert_id: string }>) {
  const certificateId = params.cert_id

  return <div>Certificate: {certificateId}</div>
}
