import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { get, _delete } from '../../api/axios'

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
    Button,
    Pagination,
    Input,
    Select
} from '@windmill/react-ui'
import {
    IoPencil,
    IoTrash,
    IoEye,
    IoPerson,
    IoBusinessOutline,
    IoCalendarOutline
} from 'react-icons/io5'

function CateringQuotations() {
    const history = useHistory()

    const [pageTable, setPageTable] = useState(1)
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [statusFilter, setStatusFilter] = useState('')
    const [clientFilter, setClientFilter] = useState('')
    const [clientsList, setClientsList] = useState([])

    const fetchCateringQuotations = async (page = 1, status = '', client = '') => {
        try {
            setLoading(true)
            setError('')

            const params = new URLSearchParams({
                page: page.toString(),
                limit: resultsPerPage.toString()
            })

            if (status) {
                params.append('status', status)
            }

            if (client) {
                params.append('client', client)
            }

            const response = await get(`/catering-quotations?${params.toString()}`)

            if (response.success) {
                setDataTable(response.data.quotations)
                setTotalResults(response.data.pagination.total)
                setTotalPages(response.data.pagination.pages)
            } else {
                setError(response.message || 'Failed to fetch catering quotations')
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch catering quotations')
            console.error('Error fetching catering quotations:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchClients = async () => {
        try {
            const response = await get("/clients")
            if (response.success) {
                setClientsList(response.data.clients || [])
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
        }
    }

    const handleStatusFilter = (e) => {
        const value = e.target.value
        setStatusFilter(value)
        setPageTable(1)
        fetchCateringQuotations(1, value, clientFilter)
    }

    const handleClientFilter = (e) => {
        const value = e.target.value
        setClientFilter(value)
        setPageTable(1)
        fetchCateringQuotations(1, statusFilter, value)
    }

    const handleDelete = async (quotation) => {
        const displayId = quotation._id?.slice(-8).toUpperCase() || 'N/A';
        if (window.confirm(`Are you sure you want to delete catering quotation ${displayId}? This action cannot be undone.`)) {
            try {
                const response = await _delete(`/catering-quotations/${quotation._id}`)

                if (response.success) {
                    fetchCateringQuotations(pageTable, statusFilter, clientFilter)
                    alert('Catering quotation deleted successfully')
                } else {
                    alert(response.message || 'Failed to delete catering quotation')
                }
            } catch (error) {
                alert(error.response?.data?.message || error.message || 'Failed to delete catering quotation')
                console.error('Error deleting catering quotation:', error)
            }
        }
    }

    function onPageChange(p) {
        setPageTable(p)
        fetchCateringQuotations(p, statusFilter, clientFilter)
    }

    const getStatusBadgeType = (status) => {
        switch (status) {
            case 'quotation': return 'primary'
            case 'invoice': return 'success'
            default: return 'neutral'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'quotation': 
                return 'bg-blue-500'
            case 'invoice': 
                return 'bg-green-500'
            default: 
                return 'bg-gray-500'
        }
    }

    useEffect(() => {
        fetchCateringQuotations(1, '', '')
        fetchClients()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
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
                        onClick={() => fetchCateringQuotations(1, '', '')}
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
                <PageTitle>Catering Quotations</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={() => history.push('/app/catering-quotations/create')}
                >
                    Create Catering Quotation
                </Button>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                >
                    <option value="">All Statuses</option>
                    <option value="quotation">Quotation</option>
                    <option value="invoice">Invoice</option>
                </Select>
                <Select
                    value={clientFilter}
                    onChange={handleClientFilter}
                >
                    <option value="">All Clients</option>
                    {clientsList.map((client) => (
                        <option key={client._id} value={client._id}>
                            {client.name} - {client.businessName}
                        </option>
                    ))}
                </Select>
            </div>

            {dataTable.length === 0 && !statusFilter && !clientFilter ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No catering quotations found</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={() => history.push('/app/catering-quotations/create')}
                    >
                        Create Your First Catering Quotation
                    </Button>
                </div>
            ) : dataTable.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No catering quotations found matching your criteria</p>
                    <Button
                        layout="outline"
                        onClick={() => {
                            setStatusFilter('')
                            setClientFilter('')
                            fetchCateringQuotations(1, '', '')
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <>
                    <div className="hidden md:block">
                        <TableContainer className="mb-8">
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell>Status</TableCell>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Client</TableCell>
                                        <TableCell>Thaals</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Grand Total</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {dataTable.map((quotation) => (
                                        <TableRow key={quotation._id}>
                                            <TableCell>
                                                <Badge type={getStatusBadgeType(quotation.status)}>
                                                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">#{quotation._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-semibold">
                                                        {quotation.client?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        {quotation.client?.businessName || ''}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {quotation.menu?.numberOfThaals || 0} thaals
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {new Date(quotation.createdAt).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold">
                                                    {(quotation.costing?.grandTotal || 0).toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="View"
                                                        onClick={() => history.push(`/app/catering-quotations/view/${quotation._id}`)}
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Edit"
                                                        onClick={() => history.push(`/app/catering-quotations/edit/${quotation._id}`)}
                                                    >
                                                        <IoPencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(quotation)}
                                                    >
                                                        <IoTrash className="w-4 h-4" />
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

                    <div className="block md:hidden">
                        <div className="space-y-4 mb-8">
                            {dataTable.map((quotation) => (
                                <div
                                    key={quotation._id}
                                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm border border-orange-200 relative"
                                >
                                    <div className="flex justify-between items-start mb-4">
<div className={`${getStatusColor(quotation.status)} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            {quotation.status.toUpperCase()}
                                        </div>
                                        <div className="text-gray-600 font-medium text-sm">
                                            #{quotation._id?.slice(-8).toUpperCase() || 'N/A'}
                                        </div>
                                    </div>

                                    <h3 className="text-gray-800 font-semibold text-lg mb-4 leading-tight">
                                        Catering Quotation
                                    </h3>

                                    <div className="flex items-center mb-2 text-gray-600">
                                        <IoPerson className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm font-medium">
                                            {quotation.client?.name || 'N/A'}
                                        </span>
                                    </div>

                                    {quotation.client?.businessName && (
                                        <div className="flex items-center mb-2 text-gray-600">
                                            <IoBusinessOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm">
                                                {quotation.client.businessName}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center mb-2 text-gray-600">
                                        <span className="text-sm font-medium">
                                            Thaals: {quotation.menu?.numberOfThaals || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center mb-4 text-gray-600">
                                        <IoCalendarOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                            Created on {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    <div className="text-3xl font-bold text-orange-700 mb-4">
                                        {(quotation.costing?.grandTotal || 0).toLocaleString()}
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => history.push(`/app/catering-quotations/view/${quotation._id}`)}
                                            className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                            aria-label="View"
                                        >
                                            <IoEye className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => history.push(`/app/catering-quotations/edit/${quotation._id}`)}
                                            className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                            aria-label="Edit"
                                        >
                                            <IoPencil className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quotation)}
                                            className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <IoTrash className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

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
        </>
    )
}

export default CateringQuotations