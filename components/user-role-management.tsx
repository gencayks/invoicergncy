"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Mail } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member" | "viewer"
  active: boolean
  lastActive?: string
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    active: true,
    lastActive: "2023-04-01T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "admin",
    active: true,
    lastActive: "2023-04-02T14:45:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "member",
    active: true,
    lastActive: "2023-04-01T09:15:00Z",
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    role: "viewer",
    active: false,
  },
]

const roleDescriptions = {
  owner: "Full access to all features and settings. Can manage users and billing.",
  admin: "Can create and manage invoices, customers, and reports. Cannot manage billing.",
  member: "Can create and manage invoices and customers. Cannot access reports or settings.",
  viewer: "Can view invoices and reports. Cannot create or edit any data.",
}

export default function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "member",
  })
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) return

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as "owner" | "admin" | "member" | "viewer",
      active: true,
    }

    setUsers([...users, user])
    setNewUser({ name: "", email: "", role: "member" })
    setIsAddingUser(false)
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)))

    setEditingUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handleToggleActive = (userId: string, active: boolean) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, active } : user)))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-xl">User Management</h2>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Invite a team member to collaborate on invoices</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name || ""}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role || "member"}
                  onValueChange={(value: "owner" | "admin" | "member" | "viewer") =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                {newUser.role && (
                  <p className="text-xs text-gray-500 mt-1">
                    {roleDescriptions[newUser.role as keyof typeof roleDescriptions]}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="capitalize">{user.role}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${user.active ? "bg-green-500" : "bg-gray-300"}`} />
                      <span>{user.active ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.lastActive)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user details and permissions</DialogDescription>
                          </DialogHeader>

                          {editingUser && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingUser.name}
                                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                  value={editingUser.role}
                                  onValueChange={(value: "owner" | "admin" | "member" | "viewer") =>
                                    setEditingUser({ ...editingUser, role: value })
                                  }
                                  disabled={editingUser.role === "owner"}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>

                                <p className="text-xs text-gray-500 mt-1">{roleDescriptions[editingUser.role]}</p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="user-active"
                                  checked={editingUser.active}
                                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, active: checked })}
                                  disabled={editingUser.role === "owner"}
                                />
                                <Label htmlFor="user-active">User is active</Label>
                              </div>
                            </div>
                          )}

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateUser}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === "owner"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Role Permissions</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start space-x-2">
            <span className="font-semibold min-w-[80px]">Owner:</span>
            <span>{roleDescriptions.owner}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-semibold min-w-[80px]">Admin:</span>
            <span>{roleDescriptions.admin}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-semibold min-w-[80px]">Member:</span>
            <span>{roleDescriptions.member}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-semibold min-w-[80px]">Viewer:</span>
            <span>{roleDescriptions.viewer}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
