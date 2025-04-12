import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
