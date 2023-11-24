export interface PageProps {
  readonly params: { readonly slug: string }
  readonly searchParams: { readonly [key: string]: string | string[] | undefined }
}
