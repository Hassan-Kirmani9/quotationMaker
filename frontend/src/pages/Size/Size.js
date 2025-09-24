import React, { useState, useEffect } from 'react'
import { get, post, _delete, put } from '../../api/axios'

import PageTitle from '../../components/Typography/PageTitle'
import {
    Table,
    TableHeader,
    TableCell,
    TableBody,
    TableRow,
    TableFooter,
    TableContainer,
    Button,
    Pagination,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    HelperText
} from '@windmill/react-ui'
import { EditIcon, TrashIcon } from '../../icons'
import {
    IoPencil,
    IoTrash,
    IoResize,
    IoAdd
} from 'react-icons/io5'
import { formatDate } from '../../utils/dateFormatter'

function Sizes() {
    const [pageTable, setPageTable] = useState(1)
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [searchTerm, setSearchTerm] = useState('')

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [createFormData, setCreateFormData] = useState({
        name: ''
    })
    const [createLoading, setCreateLoading] = useState(false)
    const [createErrors, setCreateErrors] = useState({})
    const [createApiError, setCreateApiError] = useState('')

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingSize, setEditingSize] = useState(null)
    const [editFormData, setEditFormData] = useState({
        name: ''
    })
    const [editLoading, setEditLoading] = useState(false)
    const [editErrors, setEditErrors] = useState({})
    const [editApiError, setEditApiError] = useState('')

    const fetchSizes = async (page = 1, search = '') => {
        try {
            setLoading(true)
            setError('')

            const params = new URLSearchParams({
                page: page.toString(),
                limit: resultsPerPage.toString()
            })

            if (search) params.append('search', search)

            const response = await get(`/sizes/?${params.toString()}`)

            if (response.success) {
                setDataTable(response.data.sizes)
                setTotalResults(response.data.pagination.total)
                setTotalPages(response.data.pagination.pages)
            } else {
                setError(response.message || 'Failed to fetch sizes')
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch sizes')
            console.error('Error fetching sizes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        setPageTable(1)

        const timeoutId = setTimeout(() => {
            fetchSizes(1, value)
        }, 500)

        return () => clearTimeout(timeoutId)
    }


    const handleDelete = async (id, sizeName) => {
        if (window.confirm(`Are you sure you want to delete "${sizeName}"? This action cannot be undone.`)) {
            try {
                const response = await _delete(`/sizes/${id}`)

                if (response.success) {
                    fetchSizes(pageTable, searchTerm)
                    alert('Size deleted successfully')
                } else {
                    alert(response.message || 'Failed to delete size')
                }
            } catch (error) {
                alert(error.response?.data?.message || error.message || 'Failed to delete size')
                console.error('Error deleting size:', error)
            }
        }
    }


    const openCreateModal = () => {
        setCreateFormData({ name: '' })
        setCreateErrors({})
        setCreateApiError('')
        setIsCreateModalOpen(true)
    }

    const closeCreateModal = () => {
        setIsCreateModalOpen(false)
        setCreateFormData({ name: '' })
        setCreateErrors({})
        setCreateApiError('')
    }

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target
        setCreateFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (createErrors[name]) {
            setCreateErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }

        if (createApiError) {
            setCreateApiError('')
        }
    }

    const validateCreateForm = () => {
        const newErrors = {}

        if (!createFormData.name.trim()) {
            newErrors.name = 'Size name is required'
        } else if (createFormData.name.length > 50) {
            newErrors.name = 'Size name cannot exceed 50 characters'
        }

        setCreateErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateSubmit = async (e) => {
        e.preventDefault()

        if (!validateCreateForm()) {
            return
        }

        setCreateLoading(true)
        setCreateApiError('')

        try {
            const cleanedData = {
                name: createFormData.name.trim()
            }

            const response = await post('/sizes', cleanedData)

            if (response.success) {
                alert('Size created successfully!')
                closeCreateModal()
                fetchSizes(pageTable, searchTerm)
            } else {
                setCreateApiError(response.message || 'Failed to create size. Please try again.')
            }
        } catch (error) {
            console.error('Error creating size:', error)

            if (error.response?.data?.message) {
                setCreateApiError(error.response.data.message)
            } else if (error.message) {
                setCreateApiError(error.message)
            } else {
                setCreateApiError('Failed to create size. Please check your connection and try again.')
            }
        } finally {
            setCreateLoading(false)
        }
    }


    const handleEdit = (size) => {
        setEditingSize(size)
        setEditFormData({
            name: size.name
        })
        setEditErrors({})
        setEditApiError('')
        setIsEditModalOpen(true)
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false)
        setEditingSize(null)
        setEditFormData({ name: '' })
        setEditErrors({})
        setEditApiError('')
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (editErrors[name]) {
            setEditErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }

        if (editApiError) {
            setEditApiError('')
        }
    }

    const validateEditForm = () => {
        const newErrors = {}

        if (!editFormData.name.trim()) {
            newErrors.name = 'Size name is required'
        } else if (editFormData.name.length > 50) {
            newErrors.name = 'Size name cannot exceed 50 characters'
        }

        setEditErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()

        if (!validateEditForm()) {
            return
        }

        setEditLoading(true)
        setEditApiError('')

        try {
            const cleanedData = {
                name: editFormData.name.trim()
            }

            const response = await put(`/sizes/${editingSize._id}`, cleanedData)

            if (response.success) {
                alert('Size updated successfully!')
                closeEditModal()
                fetchSizes(pageTable, searchTerm)
            } else {
                setEditApiError(response.message || 'Failed to update size. Please try again.')
            }
        } catch (error) {
            console.error('Error updating size:', error)

            if (error.response?.data?.message) {
                setEditApiError(error.response.data.message)
            } else if (error.message) {
                setEditApiError(error.message)
            } else {
                setEditApiError('Failed to update size. Please check your connection and try again.')
            }
        } finally {
            setEditLoading(false)
        }
    }

    const onPageChange = (p) => {
        setPageTable(p)
        fetchSizes(p, searchTerm)
    }

    useEffect(() => {
        fetchSizes(1, '')
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading sizes...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <Button
                        onClick={() => fetchSizes(1, '')}
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <PageTitle>Sizes</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={openCreateModal}
                >
                    <IoAdd className="w-4 h-4 mr-2" />
                    Add Size
                </Button>
            </div>

            { }
            <div className="mb-4">
                <Input
                    placeholder="Search sizes by name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-1/3"
                />
            </div>

            {dataTable.length === 0 && !searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No sizes found</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={openCreateModal}
                    >
                        <IoAdd className="w-4 h-4 mr-2" />
                        Create Your First Size
                    </Button>
                </div>
            ) : dataTable.length === 0 && searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No sizes found for "{searchTerm}"</p>
                    <Button
                        layout="outline"
                        onClick={() => {
                            setSearchTerm('')
                            fetchSizes(1, '')
                        }}
                    >
                        Clear Search
                    </Button>
                </div>
            ) : (
                <>
                    { }
                    <div className="hidden md:block">
                        <TableContainer className="mb-8">
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell>Size Name</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {dataTable.map((size) => (
                                        <TableRow key={size._id}>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <div>
                                                        <p className="font-semibold">{size.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {formatDate(size.createdAt)}                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-4">
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Edit"
                                                        onClick={() => handleEdit(size)}
                                                    >
                                                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                                                    </Button>

                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(size._id, size.name)}
                                                    >
                                                        <TrashIcon className="w-5 h-5" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <TableFooter>
                                    <Pagination
                                        totalResults={totalResults}
                                        resultsPerPage={resultsPerPage}
                                        onChange={onPageChange}
                                        label="Table navigation"
                                    />
                                </TableFooter>
                            )}
                        </TableContainer>
                    </div>

                    { }
                    <div className="block md:hidden">
                        <div className="space-y-4 mb-8">
                            {dataTable.map((size) => (
                                <div
                                    key={size._id}
                                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-200 relative"
                                >
                                    { }
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-gray-800 font-semibold text-lg leading-tight flex-1 pr-4">
                                            {size.name}
                                        </h3>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(size)}
                                                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                                aria-label="Edit"
                                            >
                                                <IoPencil className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(size._id, size.name)}
                                                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                                aria-label="Delete"
                                            >
                                                <IoTrash className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    { }
                                    <div className="flex items-center">
                                        <IoResize className="w-4 h-4 mr-2 text-purple-600" />
                                        <div className="text-sm text-gray-600">
                                            Created: {formatDate(size.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        { }
                        {totalPages > 1 && (
                            <div className="flex justify-center">
                                <Pagination
                                    totalResults={totalResults}
                                    resultsPerPage={resultsPerPage}
                                    onChange={onPageChange}
                                    label="Table navigation"
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            { }
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
                <ModalHeader>Create New Size</ModalHeader>
                <ModalBody className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleCreateSubmit}>
                        {createApiError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {createApiError}
                            </div>
                        )}

                        <Label>
                            <span>Size Name *</span>
                            <Input
                                className="mt-1"
                                name="name"
                                value={createFormData.name}
                                onChange={handleCreateInputChange}
                                required
                                valid={!createErrors.name}
                                maxLength={50}
                            />
                            {createErrors.name && (
                                <HelperText valid={false}>{createErrors.name}</HelperText>
                            )}
                        </Label>
                    </form>
                </ModalBody>
                <ModalFooter className="flex-shrink-0">
                    <div className="hidden sm:block">
                        <Button layout="outline" onClick={closeCreateModal} disabled={createLoading}>
                            Cancel
                        </Button>
                    </div>
                    <div className="hidden sm:block">
                        <Button
                            onClick={handleCreateSubmit}
                            style={{ backgroundColor: "#AA1A21" }}
                            className="text-white"
                            disabled={createLoading}
                        >
                            {createLoading ? 'Creating...' : 'Create Size'}
                        </Button>
                    </div>
                    <div className="block w-full sm:hidden">
                        <Button block size="large" layout="outline" onClick={closeCreateModal} disabled={createLoading}>
                            Cancel
                        </Button>
                    </div>
                    <div className="block w-full sm:hidden">
                        <Button
                            block
                            size="large"
                            onClick={handleCreateSubmit}
                            style={{ backgroundColor: "#AA1A21" }}
                            className="text-white"
                            disabled={createLoading}
                        >
                            {createLoading ? 'Creating...' : 'Create Size'}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>

            { }
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
                <ModalHeader>Edit Size</ModalHeader>
                <ModalBody className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleEditSubmit}>
                        {editApiError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {editApiError}
                            </div>
                        )}

                        <Label>
                            <span>Size Name *</span>
                            <Input
                                className="mt-1"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditInputChange}
                                placeholder="Enter size name"
                                required
                                valid={!editErrors.name}
                                maxLength={50}
                            />
                            {editErrors.name && (
                                <HelperText valid={false}>{editErrors.name}</HelperText>
                            )}
                        </Label>
                    </form>
                </ModalBody>
                <ModalFooter className="flex-shrink-0">
                    <div className="hidden sm:block">
                        <Button layout="outline" onClick={closeEditModal} disabled={editLoading}>
                            Cancel
                        </Button>
                    </div>
                    <div className="hidden sm:block">
                        <Button
                            onClick={handleEditSubmit}
                            style={{ backgroundColor: "#AA1A21" }}
                            className="text-white"
                            disabled={editLoading}
                        >
                            {editLoading ? 'Updating...' : 'Update Size'}
                        </Button>
                    </div>
                    <div className="block w-full sm:hidden">
                        <Button block size="large" layout="outline" onClick={closeEditModal} disabled={editLoading}>
                            Cancel
                        </Button>
                    </div>
                    <div className="block w-full sm:hidden">
                        <Button
                            block
                            size="large"
                            onClick={handleEditSubmit}
                            style={{ backgroundColor: "#AA1A21" }}
                            className="text-white"
                            disabled={editLoading}
                        >
                            {editLoading ? 'Updating...' : 'Update Size'}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default Sizes