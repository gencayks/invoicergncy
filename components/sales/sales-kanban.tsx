"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"

// Sample data - in a real app, this would come from your API
const initialColumns = {
  leads: [
    { id: "l1", title: "ABC Corp", value: "$5,200", date: "2023-04-15" },
    { id: "l2", title: "XYZ Industries", value: "$8,750", date: "2023-04-18" },
    { id: "l3", title: "Acme Co", value: "$3,400", date: "2023-04-20" },
  ],
  negotiation: [
    { id: "n1", title: "Global Tech", value: "$12,000", date: "2023-04-10" },
    { id: "n2", title: "Innovative Solutions", value: "$7,500", date: "2023-04-12" },
  ],
  proposal: [
    { id: "p1", title: "Enterprise Inc", value: "$15,800", date: "2023-04-05" },
    { id: "p2", title: "Future Systems", value: "$9,200", date: "2023-04-08" },
  ],
  closed: [
    { id: "c1", title: "Tech Giants", value: "$22,500", date: "2023-04-01" },
    { id: "c2", title: "Smart Solutions", value: "$11,300", date: "2023-04-03" },
  ],
}

export function SalesKanban() {
  const [columns, setColumns] = useState(initialColumns)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sales Pipeline</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KanbanColumn
          title="Leads"
          count={columns.leads.length}
          items={columns.leads}
          color="bg-blue-100 text-blue-800"
        />

        <KanbanColumn
          title="Negotiation"
          count={columns.negotiation.length}
          items={columns.negotiation}
          color="bg-yellow-100 text-yellow-800"
        />

        <KanbanColumn
          title="Proposal"
          count={columns.proposal.length}
          items={columns.proposal}
          color="bg-purple-100 text-purple-800"
        />

        <KanbanColumn
          title="Closed Won"
          count={columns.closed.length}
          items={columns.closed}
          color="bg-green-100 text-green-800"
        />
      </div>
    </div>
  )
}

function KanbanColumn({ title, count, items, color }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">{title}</h3>
        <Badge className={color}>{count}</Badge>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 flex-1 min-h-[500px]">
        {items.map((item) => (
          <Card key={item.id} className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">{item.value}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
