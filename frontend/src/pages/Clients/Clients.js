import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { get, _delete, put } from '../../api/axios'

import PageTitle from '../../components/Typography/PageTitle'
import {
    Table,
    TableHeader,
    TableCell,
    TableBody,
    TableRow,
    TableFooter,
    TableContainer,
    Badge,
    Avatar,
    Button,
    Pagination,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    Select,
    HelperText
} from '@windmill/react-ui'
import { EditIcon, TrashIcon } from '../../icons'
import {
    IoPerson,
    IoBusinessOutline,
    IoMail,
    IoCall,
    IoLocation,
    IoGlobe,
    IoPencil,
    IoTrash
} from 'react-icons/io5'

function Clients() {
    const history = useHistory()

    const [pageTable, setPageTable] = useState(1)
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    
    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState(null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        address: '',
        mobileNo: '',
        businessNo: '',
        city: '',
        country: ''
    })
    const [editLoading, setEditLoading] = useState(false)
    const [editErrors, setEditErrors] = useState({})
    const [editApiError, setEditApiError] = useState('')

    
    const [searchTerm, setSearchTerm] = useState('')

    
    const fetchClients = async (page = 1, search = '') => {
        try {
            setLoading(true)
            setError('')
            
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: resultsPerPage.toString()
            })
            
            if (search) {
                params.append('search', search)
            }

            const response = await get(`/clients?${params.toString()}`)

            if (response.success) {
                setDataTable(response.data.clients)
                setTotalResults(response.data.pagination.total)
                setTotalPages(response.data.pagination.pages)
            } else {
                setError(response.message || 'Failed to fetch clients')
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch clients')
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    
    const handleSearch = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        setPageTable(1) 
        
        
        const timeoutId = setTimeout(() => {
            fetchClients(1, value)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const handleDelete = async (id, clientName) => {
        if (window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
            try {
                const response = await _delete(`/clients/${id}`)

                if (response.success) {
                    fetchClients(pageTable, searchTerm) 
                    alert('Client deleted successfully')
                } else {
                    alert(response.message || 'Failed to delete client')
                }
            } catch (error) {
                alert(error.response?.data?.message || error.message || 'Failed to delete client')
                console.error('Error deleting client:', error)
            }
        }
    }

    const handleEdit = (client) => {
        setEditingClient(client)
        setEditFormData({
            name: client.name,
            businessName: client.businessName,
            email: client.email,
            address: client.address,
            mobileNo: client.mobileNo,
            businessNo: client.businessNo || '',
            city: client.city,
            country: client.country
        })
        setEditErrors({})
        setEditApiError('')
        setIsModalOpen(true)
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
            newErrors.name = 'Client name is required'
        }

        if (!editFormData.businessName.trim()) {
            newErrors.businessName = 'Business name is required'
        }

        if (!editFormData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (!editFormData.address.trim()) {
            newErrors.address = 'Address is required'
        }

        if (!editFormData.mobileNo.trim()) {
            newErrors.mobileNo = 'Mobile number is required'
        }

        if (!editFormData.city.trim()) {
            newErrors.city = 'City is required'
        }

        if (!editFormData.country.trim()) {
            newErrors.country = 'Country is required'
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
            const response = await put(`/clients/${editingClient._id}`, editFormData)

            if (response.success) {
                alert('Client updated successfully!')
                closeModal()
                fetchClients(pageTable, searchTerm) 
            } else {
                setEditApiError(response.message || 'Failed to update client. Please try again.')
            }
        } catch (error) {
            console.error('Error updating client:', error)

            if (error.response?.data?.message) {
                setEditApiError(error.response.data.message)
            } else if (error.message) {
                setEditApiError(error.message)
            } else {
                setEditApiError('Failed to update client. Please check your connection and try again.')
            }
        } finally {
            setEditLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingClient(null)
        setEditFormData({
            name: '',
            businessName: '',
            email: '',
            address: '',
            mobileNo: '',
            businessNo: '',
            city: '',
            country: ''
        })
        setEditErrors({})
        setEditApiError('')
    }

    
    function onPageChange(p) {
        setPageTable(p)
        fetchClients(p, searchTerm)
    }

    useEffect(() => {
        fetchClients(1, '')
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading clients...</p>
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
                        onClick={() => fetchClients(1, '')}
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
                <PageTitle>Clients</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={() => history.push('/app/clients/create')}
                >
                    Add Client
                </Button>
            </div>

            {}
            <div className="mb-4">
                <Input
                    placeholder="Search clients by name, business name, email, or city..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-1/3"
                />
            </div>

            {dataTable.length === 0 && !searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No clients found</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={() => history.push('/app/clients/create')}
                    >
                        Create Your First Client
                    </Button>
                </div>
            ) : dataTable.length === 0 && searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No clients found for "{searchTerm}"</p>
                    <Button
                        layout="outline"
                        onClick={() => {
                            setSearchTerm('')
                            fetchClients(1, '')
                        }}
                    >
                        Clear Search
                    </Button>
                </div>
            ) : (
                <>
                    {}
                    <div className="hidden md:block">
                        <TableContainer className="mb-8">
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Business Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>City</TableCell>
                                        <TableCell>Country</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {dataTable.map((client) => (
                                        <TableRow key={client._id}>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <div>
                                                        <p className="font-semibold">{client.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{client.businessName}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{client.email}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{client.mobileNo}</div>
                                                    {client.businessNo && (
                                                        <div className="text-gray-500 text-xs">Business: {client.businessNo}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{client.city}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{client.country}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-4">
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Edit"
                                                        onClick={() => handleEdit(client)}
                                                    >
                                                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                                                    </Button>

                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(client._id, client.name)}
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

                    {}
                    <div className="block md:hidden">
                        <div className="space-y-4 mb-8">
                            {dataTable.map((client) => (
                                <div
                                    key={client._id}
                                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200 relative"
                                >
                                    {}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-gray-800 font-semibold text-lg leading-tight">
                                            {client.name}
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                                aria-label="Edit"
                                            >
                                                <IoPencil className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client._id, client.name)}
                                                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                                aria-label="Delete"
                                            >
                                                <IoTrash className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {}
                                    <div className="flex items-center mb-3 text-gray-600">
                                        <IoBusinessOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm font-medium">
                                            {client.businessName}
                                        </span>
                                    </div>

                                    {}
                                    <div className="flex items-center mb-3 text-gray-600">
                                        <IoMail className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm break-all">
                                            {client.email}
                                        </span>
                                    </div>

                                    {}
                                    <div className="flex items-center mb-3 text-gray-600">
                                        <IoCall className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div>{client.mobileNo}</div>
                                            {client.businessNo && (
                                                <div className="text-gray-500 text-xs mt-1">
                                                    Business: {client.businessNo}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {}
                                    <div className="flex items-center mb-3 text-gray-600">
                                        <IoLocation className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                            {client.city}, {client.country}
                                        </span>
                                    </div>

                                    {}
                                    <div className="flex items-start text-gray-600">
                                        <IoGlobe className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">
                                            {client.address}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {}
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

            {}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalHeader>Edit Client</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleEditSubmit}>
                        {editApiError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {editApiError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Label>
                                <span>Name *</span>
                                <Input
                                    className="mt-1"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter client name"
                                    required
                                    valid={!editErrors.name}
                                />
                                {editErrors.name && (
                                    <HelperText valid={false}>{editErrors.name}</HelperText>
                                )}
                            </Label>

                            <Label>
                                <span>Business Name *</span>
                                <Input
                                    className="mt-1"
                                    name="businessName"
                                    value={editFormData.businessName}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter business name"
                                    required
                                    valid={!editErrors.businessName}
                                />
                                {editErrors.businessName && (
                                    <HelperText valid={false}>{editErrors.businessName}</HelperText>
                                )}
                            </Label>

                            <Label className="md:col-span-2">
                                <span>Email *</span>
                                <Input
                                    className="mt-1"
                                    name="email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter email address"
                                    required
                                    valid={!editErrors.email}
                                />
                                {editErrors.email && (
                                    <HelperText valid={false}>{editErrors.email}</HelperText>
                                )}
                            </Label>

                            <Label className="md:col-span-2">
                                <span>Address *</span>
                                <Input
                                    className="mt-1"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter complete address"
                                    required
                                    valid={!editErrors.address}
                                />
                                {editErrors.address && (
                                    <HelperText valid={false}>{editErrors.address}</HelperText>
                                )}
                            </Label>

                            <Label>
                                <span>Mobile No *</span>
                                <Input
                                    className="mt-1"
                                    name="mobileNo"
                                    value={editFormData.mobileNo}
                                    onChange={handleEditInputChange}
                                    placeholder="+1-555-0123"
                                    required
                                    valid={!editErrors.mobileNo}
                                />
                                {editErrors.mobileNo && (
                                    <HelperText valid={false}>{editErrors.mobileNo}</HelperText>
                                )}
                            </Label>

                            <Label>
                                <span>Business No</span>
                                <Input
                                    className="mt-1"
                                    name="businessNo"
                                    value={editFormData.businessNo}
                                    onChange={handleEditInputChange}
                                    placeholder="+1-555-0124 (Optional)"
                                    valid={!editErrors.businessNo}
                                />
                                {editErrors.businessNo && (
                                    <HelperText valid={false}>{editErrors.businessNo}</HelperText>
                                )}
                            </Label>

                            <Label>
                                <span>City *</span>
                                <Input
                                    className="mt-1"
                                    name="city"
                                    value={editFormData.city}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter city"
                                    required
                                    valid={!editErrors.city}
                                />
                                {editErrors.city && (
                                    <HelperText valid={false}>{editErrors.city}</HelperText>
                                )}
                            </Label>

                            <Label>
                                <span>Country *</span>
                                <Input
                                    className="mt-1"
                                    name="country"
                                    value={editFormData.country}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter country"
                                    required
                                    valid={!editErrors.country}
                                />
                                {editErrors.country && (
                                    <HelperText valid={false}>{editErrors.country}</HelperText>
                                )}
                            </Label>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <div className="hidden sm:block">
                        <Button layout="outline" onClick={closeModal} disabled={editLoading}>
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
                            {editLoading ? 'Updating...' : 'Update Client'}
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
                            {editLoading ? 'Updating...' : 'Update Client'}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default Clients