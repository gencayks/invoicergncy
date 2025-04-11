"use client"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Input } from "@/components/ui/input"
import { PlusCircle, Trash2, GripVertical } from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

interface DragDropInvoiceItemsProps {
  items: InvoiceItem[]
  onItemsChange: (items: InvoiceItem[]) => void
  currencySymbol: string
}

export default function DragDropInvoiceItems({ items, onItemsChange, currencySymbol }: DragDropInvoiceItemsProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const reorderedItems = Array.from(items)
    const [removed] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, removed)

    onItemsChange(reorderedItems)
  }

  const addItem = () => {
    onItemsChange([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        price: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      onItemsChange(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    onItemsChange(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  return (
    <div>
      <h2 className="font-serif text-xl mb-4">Invoice Items</h2>

      <div className="mb-2 grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 px-2">
        <div className="col-span-1"></div>
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-right">Quantity</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-right">Amount</div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="invoice-items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="grid grid-cols-12 gap-2 items-center border rounded-md p-2 bg-white"
                    >
                      <div className="col-span-1 flex justify-center cursor-move" {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="col-span-5">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Item description"
                          className="w-full border rounded h-10"
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          className="w-full text-right border rounded h-10"
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                          className="w-full text-right border rounded h-10"
                        />
                      </div>

                      <div className="col-span-1 text-right whitespace-nowrap font-medium">
                        {currencySymbol}
                        {(item.quantity * item.price).toFixed(2)}
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button onClick={addItem} className="mt-4 text-gray-700 hover:text-gray-900 flex items-center text-sm">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Item
      </button>
    </div>
  )
}
