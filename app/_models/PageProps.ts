export interface PageProps<TParam extends Record<string, unknown>> {
  readonly params: TParam
  readonly searchParams: { readonly [key: string]: string | string[] | undefined }
}
