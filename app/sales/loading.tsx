import AppHeader from "@/components/app-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SalesLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  )
}
