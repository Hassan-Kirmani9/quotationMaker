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
    Button,
    Pagination,
    Input
} from '@windmill/react-ui'
import {
    IoPencil,
    IoTrash,
    IoEye,
    IoCopy,
    IoPerson,
    IoBusinessOutline,
    IoCalendarOutline
} from 'react-icons/io5'

function Quotations() {
    const history = useHistory()

    const [pageTable, setPageTable] = useState(1)
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [searchTerm, setSearchTerm] = useState('')

    const getDisplayNumber = (quotation) => {
        if (!quotation.quotationNo) return 'N/A'
        if (quotation.status === 'invoice') {
            return quotation.quotationNo.replace(/^QUO-/, 'INV-')
        }
        return quotation.quotationNo
    }

    const fetchQuotations = async (page = 1, search = '') => {
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

            const response = await get(`/quotations?${params.toString()}`)

            if (response.success) {
                setDataTable(response.data.quotations)
                setTotalResults(response.data.pagination.total)
                setTotalPages(response.data.pagination.pages)
            } else {
                setError(response.message || 'Failed to fetch quotations')
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch quotations')
            console.error('Error fetching quotations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        setPageTable(1)

        const timeoutId = setTimeout(() => {
            fetchQuotations(1, value)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const handleDelete = async (quotation) => {
        const displayNumber = getDisplayNumber(quotation);
        if (window.confirm(`Are you sure you want to delete quotation ${displayNumber}? This action cannot be undone.`)) {
            try {
                const response = await _delete(`/quotations/${quotation._id}`)

                if (response.success) {
                    fetchQuotations(pageTable, searchTerm)
                    alert('Quotation deleted successfully')
                } else {
                    alert(response.message || 'Failed to delete quotation')
                }
            } catch (error) {
                alert(error.response?.data?.message || error.message || 'Failed to delete quotation')
                console.error('Error deleting quotation:', error)
            }
        }
    }

    function onPageChange(p) {
        setPageTable(p)
        fetchQuotations(p, searchTerm)
    }

    const getStatusBadgeType = (status) => {
        switch (status) {
            case 'accepted': return 'success'
            case 'sent': return 'primary'
            case 'viewed': return 'warning'
            case 'draft': return 'neutral'
            case 'rejected': return 'danger'
            case 'expired': return 'danger'
            case 'invoice': return 'success'
            case 'quotation': return 'primary'
            default: return 'neutral'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
            case 'approved':
            case 'invoice':
                return 'bg-green-500'
            case 'sent': 
            case 'quotation': return 'bg-blue-500'
            case 'viewed': return 'bg-yellow-500'
            case 'draft': return 'bg-gray-500'
            case 'rejected': return 'bg-red-500'
            case 'expired': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const formatCurrency = (amount, currency = 'USD') => {
        const symbols = {
            USD: '$', EUR: '€', GBP: '£', AED: 'AED', PKR: '₨',
            CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹', SAR: 'SR'
        }
        return `${symbols[currency] || currency} ${amount.toLocaleString()}`
    }

    useEffect(() => {
        fetchQuotations(1, '')
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading quotations...</p>
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
                        onClick={() => fetchQuotations(1, '')}
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
                <PageTitle>Quotations</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={() => history.push('/app/quotations/create')}
                >
                    Create Quotation
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Search quotations by number, title, or description..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-1/3"
                />
            </div>

            {dataTable.length === 0 && !searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No quotations found</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={() => history.push('/app/quotations/create')}
                    >
                        Create Your First Quotation
                    </Button>
                </div>
            ) : dataTable.length === 0 && searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No quotations found for "{searchTerm}"</p>
                    <Button
                        layout="outline"
                        onClick={() => {
                            setSearchTerm('')
                            fetchQuotations(1, '')
                        }}
                    >
                        Clear Search
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
                                        <TableCell>Quotation No</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Client</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Total Amount</TableCell>
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
                                                <span className="font-semibold">{getDisplayNumber(quotation)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{quotation.title}</span>
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
                                                    {new Date(quotation.date).toLocaleDateString()}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm font-semibold">
                                                    {quotation.totalAmount.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="View"
                                                        onClick={() => history.push(`/app/quotations/view/${quotation._id}`)}
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Edit"
                                                        onClick={() => history.push(`/app/quotations/edit/${quotation._id}`)}
                                                        disabled={quotation.status === 'accepted' || quotation.status === 'expired'}
                                                    >
                                                        <IoPencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(quotation)}
                                                        disabled={quotation.status === 'accepted'}
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
                                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm border border-green-200 relative"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`${getStatusColor(quotation.status)} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            {quotation.status === 'accepted' ? 'APPROVED' : quotation.status.toUpperCase()}
                                        </div>
                                        <div className="text-gray-600 font-medium text-sm">
                                            {getDisplayNumber(quotation)}
                                        </div>
                                    </div>

                                    <h3 className="text-gray-800 font-semibold text-lg mb-4 leading-tight">
                                        {quotation.title}
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

                                    <div className="flex items-center mb-4 text-gray-600">
                                        <IoCalendarOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className={`text-sm ${new Date(quotation.validUntil) < new Date() ? 'text-red-600' : ''}`}>
                                            Valid until {new Date(quotation.validUntil).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    <div className="text-3xl font-bold text-green-700 mb-4">
                                        {quotation.totalAmount.toLocaleString()}
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => history.push(`/app/quotations/view/${quotation._id}`)}
                                            className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                            aria-label="View"
                                        >
                                            <IoEye className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => history.push(`/app/quotations/edit/${quotation._id}`)}
                                            disabled={quotation.status === 'accepted' || quotation.status === 'expired'}
                                            className={`bg-white border border-gray-300 rounded-lg p-2 transition-colors ${quotation.status === 'accepted' || quotation.status === 'expired'
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-gray-50'
                                                }`}
                                            aria-label="Edit"
                                        >
                                            <IoPencil className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quotation)}
                                            disabled={quotation.status === 'accepted'}
                                            className={`bg-white border border-gray-300 rounded-lg p-2 transition-colors ${quotation.status === 'accepted'
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-gray-50'
                                                }`}
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

export default Quotations