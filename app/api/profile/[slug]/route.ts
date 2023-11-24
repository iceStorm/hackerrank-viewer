import { getCerts, getProfile } from "@/app/(utils)/hackerrank-api"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const username = params.slug

  const [certs, profile] = await Promise.all([getCerts(username), getProfile(username)])
  return Response.json({ certs, profile })
}
