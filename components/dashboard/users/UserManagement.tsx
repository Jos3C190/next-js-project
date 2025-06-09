"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, User, Shield, UserCheck, Filter } from "lucide-react"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"
import { createSystemUsersApi } from "@/lib/api"
import type { SystemUser, CreateSystemUserRequest, UpdateSystemUserRequest } from "@/lib/api"
import UserForm from "./UserForm"
import ConfirmModal from "@/components/common/ConfirmModal"
import Pagination from "@/components/dashboard/common/Pagination"

// Agregar función para normalizar texto al inicio del componente, después de los imports
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .trim()
}

const UserManagement = () => {
  const { apiCall, isAuthenticated, isHydrated } = useAuthenticatedApi()
  const [users, setUsers] = useState<SystemUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<"all" | "odontologo" | "admin">("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [adminCurrentPage, setAdminCurrentPage] = useState(1)

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true)
      await apiCall(async (token) => {
        const systemUsersApi = createSystemUsersApi(token)
        const response = await systemUsersApi.getSystemUsers(1, 100) // Obtener todos
        setUsers(response.data)
        setFilteredUsers(response.data)
      })
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && isHydrated) {
      loadUsers()
    }
  }, [isAuthenticated, isHydrated])

  // Reemplazar el useEffect de filtrado con esta versión mejorada:
  useEffect(() => {
    let filtered = users

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm)

      filtered = filtered.filter((user) => {
        const normalizedNombre = normalizeText(user.nombre)
        const normalizedApellido = normalizeText(user.apellido)
        const normalizedCorreo = normalizeText(user.correo)
        const normalizedEspecialidad = normalizeText(user.especialidad)

        return (
          normalizedNombre.includes(normalizedSearchTerm) ||
          normalizedApellido.includes(normalizedSearchTerm) ||
          normalizedCorreo.includes(normalizedSearchTerm) ||
          normalizedEspecialidad.includes(normalizedSearchTerm) ||
          normalizeText(`${user.nombre} ${user.apellido}`).includes(normalizedSearchTerm)
        )
      })
    }

    // Filtrar por rol
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset página al filtrar
    setAdminCurrentPage(1) // Reset página de admins al filtrar
  }, [users, searchTerm, selectedRole])

  // Separar usuarios por rol
  const dentists = filteredUsers.filter((user) => user.role === "odontologo")
  const admins = filteredUsers.filter((user) => user.role === "admin")

  // Paginación para odontólogos
  const totalDentistPages = Math.ceil(dentists.length / itemsPerPage)
  const startDentistIndex = (currentPage - 1) * itemsPerPage
  const paginatedDentists = dentists.slice(startDentistIndex, startDentistIndex + itemsPerPage)

  // Paginación para administradores
  const totalAdminPages = Math.ceil(admins.length / itemsPerPage)
  const startAdminIndex = (adminCurrentPage - 1) * itemsPerPage
  const paginatedAdmins = admins.slice(startAdminIndex, startAdminIndex + itemsPerPage)

  // Crear usuario
  const handleCreateUser = async (userData: CreateSystemUserRequest) => {
    try {
      setIsSubmitting(true)
      await apiCall(async (token) => {
        const systemUsersApi = createSystemUsersApi(token)
        await systemUsersApi.createSystemUser(userData)
        await loadUsers()
      })
      setIsFormOpen(false)
      setSelectedUser(null)
    } catch (error: any) {
      console.error("Error creating user:", error)
      alert(error.message || "Error al crear el usuario")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Editar usuario
  const handleEditUser = async (userData: UpdateSystemUserRequest) => {
    if (!selectedUser) return

    try {
      setIsSubmitting(true)

      // Preparar los datos correctamente
      const updateData: UpdateSystemUserRequest = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        telefono: userData.telefono,
        especialidad: userData.especialidad,
        fecha_nacimiento: userData.fecha_nacimiento,
      }

      // Solo incluir password si se proporciona
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password
      }

      console.log("Datos a actualizar:", updateData) // Para debug
      console.log("ID del usuario:", selectedUser._id) // Para debug

      await apiCall(async (token) => {
        const systemUsersApi = createSystemUsersApi(token)
        await systemUsersApi.updateSystemUser(selectedUser._id, updateData)
        await loadUsers()
      })

      setIsFormOpen(false)
      setSelectedUser(null)
    } catch (error: any) {
      console.error("Error updating user:", error)

      // Mostrar error más específico
      let errorMessage = "Error al actualizar el usuario"
      if (error.message && error.message !== "Error 400: ") {
        errorMessage = error.message
      } else if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText || "Error del servidor"}`
      }

      alert(errorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await apiCall(async (token) => {
        const systemUsersApi = createSystemUsersApi(token)
        await systemUsersApi.deleteSystemUser(userToDelete._id)
        await loadUsers()
      })
      setUserToDelete(null)
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert(error.message || "Error al eliminar el usuario")
    }
  }

  const openEditForm = (user: SystemUser) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const openCreateForm = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  if (!isHydrated) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  if (!isAuthenticated) {
    return <div className="text-center text-[hsl(var(--muted-foreground))]">No autorizado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Gestión de Usuarios</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Administra el personal del sistema: odontólogos y administradores
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Odontólogo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[hsl(var(--card))] p-4 rounded-lg border border-[hsl(var(--border))]">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, correo o especialidad (sin acentos)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Filtro por rol */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] h-4 w-4" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as "all" | "odontologo" | "admin")}
                className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
              >
                <option value="all">Todos los roles</option>
                <option value="odontologo">Odontólogos</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          {selectedRole === "all" && (
            <>
              Mostrando {filteredUsers.length} usuarios ({dentists.length} odontólogos, {admins.length} administradores)
            </>
          )}
          {selectedRole === "odontologo" && <>Mostrando {dentists.length} odontólogos</>}
          {selectedRole === "admin" && <>Mostrando {admins.length} administradores</>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-[hsl(var(--muted-foreground))]">Cargando usuarios...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sección de Administradores */}
          {(selectedRole === "all" || selectedRole === "admin") && admins.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                  Administradores ({admins.length})
                </h2>
              </div>

              <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[hsl(var(--secondary))]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Especialidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Fecha Nacimiento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {paginatedAdmins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-[hsl(var(--secondary))]/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                                  {admin.nombre} {admin.apellido}
                                </div>
                                <div className="text-sm text-[hsl(var(--muted-foreground))]">Administrador</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[hsl(var(--foreground))]">{admin.correo}</div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{admin.telefono}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {admin.especialidad}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--muted-foreground))]">
                            {formatDate(admin.fecha_nacimiento)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openEditForm(admin)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Paginación para administradores */}
              {totalAdminPages > 1 && (
                <Pagination
                  currentPage={adminCurrentPage}
                  totalPages={totalAdminPages}
                  onPageChange={setAdminCurrentPage}
                />
              )}
            </div>
          )}

          {/* Sección de Odontólogos */}
          {(selectedRole === "all" || selectedRole === "odontologo") && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Odontólogos ({dentists.length})</h2>
              </div>

              {dentists.length === 0 ? (
                <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-8 text-center">
                  <User className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                  <p className="text-[hsl(var(--muted-foreground))]">No se encontraron odontólogos</p>
                </div>
              ) : (
                <>
                  <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-[hsl(var(--secondary))]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                              Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                              Contacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                              Especialidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                              Fecha Nacimiento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                          {paginatedDentists.map((dentist) => (
                            <tr key={dentist._id} className="hover:bg-[hsl(var(--secondary))]/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                      <UserCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                                      {dentist.nombre} {dentist.apellido}
                                    </div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Odontólogo</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-[hsl(var(--foreground))]">{dentist.correo}</div>
                                <div className="text-sm text-[hsl(var(--muted-foreground))]">{dentist.telefono}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {dentist.especialidad}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[hsl(var(--muted-foreground))]">
                                {formatDate(dentist.fecha_nacimiento)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => openEditForm(dentist)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setUserToDelete(dentist)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paginación solo para odontólogos */}
                  {selectedRole !== "admin" && totalDentistPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalDentistPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={selectedUser ? handleEditUser : handleCreateUser}
        user={selectedUser}
        isLoading={isSubmitting}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nombre} ${userToDelete?.apellido}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export default UserManagement
