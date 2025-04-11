import { getDraft as getLocalDraft } from "./draft-service"

export const getDraft = async (draftId: string) => {
  try {
    // Get the current user ID from localStorage
    const userJson = localStorage.getItem("supabase.auth.token")
    if (!userJson) return null

    const userData = JSON.parse(userJson)
    const userId = userData?.currentSession?.user?.id

    if (!userId) return null

    // Use the local storage implementation
    return getLocalDraft(draftId, userId)
  } catch (error) {
    console.error("Error getting draft:", error)
    return null
  }
}
