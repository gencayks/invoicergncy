"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from "date-fns"
import { Edit, Trash2, Copy, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SalesKanbanProps {
  drafts: any[]
  type: "invoice" | "offer"
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  isDeleting: string | null
}

export default function SalesKanban({ drafts, type, onEdit, onDelete, onDuplicate, isDeleting }: SalesKanbanProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  // Group drafts by status
  const [columns, setColumns] = useState({
    draft: {
      id: "draft",
      title: "Draft",
      items: drafts.filter((draft) => {
        const draftId = draft.id || ""
        const lastChar = draftId.charAt(draftId.length - 1)
        const numValue = Number.parseInt(lastChar, 16) || 0
        return numValue < 5
      }),
    },
    sent: {
      id: "sent",
      title: "Sent",
      items: drafts.filter((draft) => {
        const draftId = draft.id || ""
        const lastChar = draftId.charAt(draftId.length - 1)
        const numValue = Number.parseInt(lastChar, 16) || 0
        return numValue >= 5 && numValue < 10
      }),
    },
    paid: {
      id: "paid",
      title: "Paid",
      items: drafts.filter((draft) => {
        const draftId = draft.id || ""
        const lastChar = draftId.charAt(draftId.length - 1)
        const numValue = Number.parseInt(lastChar, 16) || 0
        return numValue >= 10
      }),
    },
  })

  const getAmount = (draft: any) => {
    // Calculate total from items or use a random amount for demonstration
    if (draft.items && draft.items.length > 0) {
      const total = draft.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 0) * (item.price || 0)
      }, 0)
      return total.toFixed(2)
    }

    // Generate a random amount based on the draft ID
    const draftId = draft.id || ""
    const lastChar = draftId.charAt(draftId.length - 1)
    const numValue = Number.parseInt(lastChar, 16) || 0
    return (numValue * 100 + 500).toFixed(2)
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // If dropped in a different column
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId as keyof typeof columns]
      const destColumn = columns[destination.droppableId as keyof typeof columns]
      const sourceItems = [...sourceColumn.items]
      const destItems = [...destColumn.items]
      const [removed] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, removed)

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      })

      // In a real app, we would update the status in the database
      toast({
        title: "Status updated",
        description: `${type === "offer" ? "Offer" : "Invoice"} moved to ${destColumn.title}`,
      })
    } else {
      // If dropped in the same column
      const column = columns[source.droppableId as keyof typeof columns]
      const copiedItems = [...column.items]
      const [removed] = copiedItems.splice(source.index, 1)
      copiedItems.splice(destination.index, 0, removed)

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      })
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="min-w-[300px] lg:w-1/3">
            <div className="bg-gray-100 rounded-md p-4 h-full">
              <h3 className="font-medium mb-4 flex justify-between items-center">
                <span>{column.title}</span>
                <span className="bg-white text-xs font-normal py-1 px-2 rounded-full">{column.items.length}</span>
              </h3>

              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 min-h-[200px]">
                    {column.items.map((draft, index) => (
                      <Draggable key={draft.id} draggableId={draft.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className="bg-white">
                              <CardHeader className="p-3 pb-0">
                                <CardTitle className="text-sm font-medium flex justify-between items-start">
                                  <span>{draft.invoiceNumber || `#${draft.id?.substring(0, 8)}`}</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => onEdit(draft.id)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {t("edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onDuplicate(draft.id)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        {t("duplicate")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => onDelete(draft.id)}
                                        disabled={isDeleting === draft.id}
                                      >
                                        {isDeleting === draft.id ? (
                                          <LoadingSpinner size="sm" className="mr-2" />
                                        ) : (
                                          <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        {t("delete")}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-2">
                                <p className="text-xs text-gray-500 truncate">
                                  {draft.notes?.substring(0, 50) || "No description"}
                                </p>
                              </CardContent>
                              <CardFooter className="p-3 pt-0 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  {draft.updatedAt ? format(new Date(draft.updatedAt), "MMM d, yyyy") : "-"}
                                </div>
                                <div className="font-medium text-sm">
                                  {draft.currency || "$"}
                                  {getAmount(draft)}
                                </div>
                              </CardFooter>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </DragDropContext>
    </div>
  )
}
