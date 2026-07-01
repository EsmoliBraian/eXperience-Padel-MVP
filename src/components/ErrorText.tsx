export function ErrorText({ error }: { error: string | null }) {
  if (!error) return null
  return <p className="text-xs text-danger">{error}</p>
}
