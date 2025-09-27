import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
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
import { formatDate } from '../../utils/dateFormatter'

function QuotationsList() {
    const history = useHistory()
    const location = useLocation()

    // Determine quotation type based on current route
    const isCateringQuotations = location.pathname.includes('/catering-quotations')

    const [pageTable, setPageTable] = useState(1)
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [clientFilter, setClientFilter] = useState('')
    const [clientsList, setClientsList] = useState([])

    // Configuration based on quotation type
    const getConfig = () => {
        if (isCateringQuotations) {
            return {
                endpoint: '/catering-quotations',
                createRoute: '/app/catering-quotations/create',
                editRoute: '/app/catering-quotations/edit',
                viewRoute: '/app/catering-quotations/view',
                title: 'Quotations',
                createButtonText: 'Create',
                emptyStateText: 'No catering quotations found',
                createFirstText: 'Create Your First Catering Quotation',
                searchPlaceholder: null, // Catering uses filters instead of search
                gradientClass: 'from-orange-50 to-orange-100',
                borderClass: 'border-orange-200',
                colorClass: 'text-orange-700',
                displayNumber: (quotation) => `#${quotation._id?.slice(-8).toUpperCase() || 'N/A'}`,
                getAmount: (quotation) => quotation.costing?.grandTotal || 0,
                hasSearch: false,
                hasFilters: true
            }
        } else {
            return {
                endpoint: '/quotations',
                createRoute: '/app/quotations/create',
                editRoute: '/app/quotations/edit',
                viewRoute: '/app/quotations/view',
                title: 'Quotations',
                createButtonText: 'Create Quotation',
                emptyStateText: 'No quotations found',
                createFirstText: 'Create Your First Quotation',
                searchPlaceholder: 'Search quotations by number, title, or description...',
                gradientClass: 'from-green-50 to-green-100',
                borderClass: 'border-green-200',
                colorClass: 'text-green-700',
                displayNumber: (quotation) => {
                    if (!quotation.quotationNo) return 'N/A'
                    if (quotation.status === 'invoice') {
                        return quotation.quotationNo.replace(/^QUO-/, 'INV-')
                    }
                    return quotation.quotationNo
                },
                getAmount: (quotation) => quotation.totalAmount || 0,
                hasSearch: true,
                hasFilters: false
            }
        }
    }

    const config = getConfig()

    const fetchQuotations = async (page = 1, search = '', status = '', client = '') => {
        try {
            setLoading(true)
            setError('')

            const params = new URLSearchParams({
                page: page.toString(),
                limit: resultsPerPage.toString()
            })

            if (search && config.hasSearch) {
                params.append('search', search)
            }

            if (status && config.hasFilters) {
                params.append('status', status)
            }

            if (client && config.hasFilters) {
                params.append('client', client)
            }

            const response = await get(`${config.endpoint}?${params.toString()}`)

            if (response.success) {
                // Handle different response structures
                const quotationsKey = isCateringQuotations ? 'quotations' : 'quotations'
                const quotations = response.data[quotationsKey] || response.data.quotations || []

                setDataTable(quotations)
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

    const fetchClients = async () => {
        if (!config.hasFilters) return

        try {
            const response = await get("/clients")
            if (response.success) {
                setClientsList(response.data.clients || [])
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
        }
    }

    const handleSearch = (e) => {
        if (!config.hasSearch) return

        const value = e.target.value
        setSearchTerm(value)
        setPageTable(1)

        const timeoutId = setTimeout(() => {
            fetchQuotations(1, value)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const handleStatusFilter = (e) => {
        if (!config.hasFilters) return

        const value = e.target.value
        setStatusFilter(value)
        setPageTable(1)
        fetchQuotations(1, searchTerm, value, clientFilter)
    }

    const handleClientFilter = (e) => {
        if (!config.hasFilters) return

        const value = e.target.value
        setClientFilter(value)
        setPageTable(1)
        fetchQuotations(1, searchTerm, statusFilter, value)
    }

    const handleDelete = async (quotation) => {
        const displayNumber = config.displayNumber(quotation)
        const quotationType = isCateringQuotations ? 'catering quotation' : 'quotation'

        if (window.confirm(`Are you sure you want to delete ${quotationType} ${displayNumber}? This action cannot be undone.`)) {
            try {
                const response = await _delete(`${config.endpoint}/${quotation._id}`)

                if (response.success) {
                    fetchQuotations(pageTable, searchTerm, statusFilter, clientFilter)
                    alert(`${quotationType.charAt(0).toUpperCase() + quotationType.slice(1)} deleted successfully`)
                } else {
                    alert(response.message || `Failed to delete ${quotationType}`)
                }
            } catch (error) {
                alert(error.response?.data?.message || error.message || `Failed to delete ${quotationType}`)
                console.error('Error deleting quotation:', error)
            }
        }
    }

    function onPageChange(p) {
        setPageTable(p)
        fetchQuotations(p, searchTerm, statusFilter, clientFilter)
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

    const getStatusBadgeColorMobile = (status) => {
        switch (status) {
            case 'accepted':
            case 'approved':
                return 'bg-green-500'
            case 'invoice':
                return 'bg-green-600'
            case 'sent':
            case 'quotation':
                return 'bg-blue-500'
            case 'viewed':
                return 'bg-yellow-500'
            case 'draft':
                return 'bg-gray-500'
            case 'rejected':
                return 'bg-red-500'
            case 'expired':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getLeftBorderColor = (status) => {
        switch (status) {
            case 'accepted':
            case 'approved':
                return '#10b981'
            case 'invoice':
                return '#059669'
            case 'sent':
            case 'quotation':
                return '#3b82f6'
            case 'viewed':
                return '#eab308'
            case 'draft':
                return '#6b7280'
            case 'rejected':
                return '#ef4444'
            case 'expired':
                return '#ef4444'
            default:
                return '#6b7280'
        }
    }

    useEffect(() => {
        fetchQuotations(1, '', '', '')
        fetchClients()
    }, [isCateringQuotations]) // Re-fetch when route changes

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quotations...</p>
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
                        onClick={() => fetchQuotations(1, '', '', '')}
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    const hasActiveFilters = config.hasSearch ? searchTerm : (statusFilter || clientFilter)
    const shouldShowEmptyState = dataTable.length === 0

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <PageTitle>{config.title}</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={() => history.push(config.createRoute)}
                >
                    {config.createButtonText}
                </Button>
            </div>

            {config.hasSearch && (
                <div className="mb-4">
                    <Input
                        placeholder={config.searchPlaceholder}
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full md:w-1/3"
                    />
                </div>
            )}

            {config.hasFilters && (
                <div className="mb-4 grid grid-cols-2 gap-4">
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
            )}

            {shouldShowEmptyState && !hasActiveFilters ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">{config.emptyStateText}</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={() => history.push(config.createRoute)}
                    >
                        {config.createFirstText}
                    </Button>
                </div>
            ) : shouldShowEmptyState && hasActiveFilters ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">
                        {config.hasSearch
                            ? `No quotations found for "${searchTerm}"`
                            : 'No quotations found matching your criteria'
                        }
                    </p>
                    <Button
                        layout="outline"
                        onClick={() => {
                            if (config.hasSearch) {
                                setSearchTerm('')
                                fetchQuotations(1, '')
                            } else {
                                setStatusFilter('')
                                setClientFilter('')
                                fetchQuotations(1, '', '', '')
                            }
                        }}
                    >
                        {config.hasSearch ? 'Clear Search' : 'Clear Filters'}
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
                                        <TableCell>{isCateringQuotations ? 'ID' : 'Quotation No'}</TableCell>
                                        {!isCateringQuotations && <TableCell>Title</TableCell>}
                                        <TableCell>Client</TableCell>
                                        {isCateringQuotations && <TableCell>Thaals</TableCell>}
                                        <TableCell>Date</TableCell>
                                        <TableCell>{isCateringQuotations ? 'Grand Total' : 'Total Amount'}</TableCell>
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
                                                <span className="font-semibold">{config.displayNumber(quotation)}</span>
                                            </TableCell>
                                            {!isCateringQuotations && (
                                                <TableCell>
                                                    <span className="text-sm">{quotation.title}</span>
                                                </TableCell>
                                            )}
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
                                            {isCateringQuotations && (
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {quotation.menu?.numberOfThaals || 0} thaals
                                                    </span>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <span className="text-sm">
                                                    {formatDate(isCateringQuotations ? quotation.createdAt : quotation.date)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold">
                                                    {config.getAmount(quotation).toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="View"
                                                        onClick={() => history.push(`${config.viewRoute}/${quotation._id}`)}
                                                    >
                                                        <IoEye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Edit"
                                                        onClick={() => history.push(`${config.editRoute}/${quotation._id}`)}
                                                        disabled={!isCateringQuotations && (quotation.status === 'accepted' || quotation.status === 'expired')}
                                                    >
                                                        <IoPencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(quotation)}
                                                        disabled={!isCateringQuotations && quotation.status === 'accepted'}
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
                        <div className="space-y-4 mb-8 pb-20">
                            {dataTable.map((quotation) => (
                                <div
                                    key={quotation._id}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 relative"
                                    style={{ borderLeft: `4px solid ${getLeftBorderColor(quotation.status)}`, borderRadius: "1rem" }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`${getStatusBadgeColorMobile(quotation.status)} text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            {quotation.status.toUpperCase()}
                                        </div>
                                        <div className="text-gray-500 font-medium text-sm dark:text-gray-400">
                                            {config.displayNumber(quotation)}
                                        </div>
                                    </div>

                                    <h3 className="text-gray-900 font-semibold text-lg mb-3 leading-tight dark:text-gray-100">
                                        {isCateringQuotations ? '' : quotation.title}
                                    </h3>

                                    <div className="flex items-center mb-2 text-gray-600 dark:text-gray-400">
                                        <IoPerson className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm font-medium">
                                            {quotation.client?.name || 'N/A'}
                                        </span>
                                    </div>

                                    {isCateringQuotations && (
                                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                            Thaals: {quotation.menu?.numberOfThaals || 0}
                                        </div>
                                    )}

                                    <div className="flex items-center mb-4 text-gray-600 dark:text-gray-400">
                                        <IoCalendarOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm">
                                            Created on {new Date(isCateringQuotations ? quotation.createdAt : quotation.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {config.getAmount(quotation).toLocaleString()}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => history.push(`${config.viewRoute}/${quotation._id}`)}
                                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                aria-label="View"
                                            >
                                                <IoEye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <button
                                                onClick={() => history.push(`${config.editRoute}/${quotation._id}`)}
                                                disabled={!isCateringQuotations && (quotation.status === 'accepted' || quotation.status === 'expired')}
                                                className={`bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 transition-colors ${!isCateringQuotations && (quotation.status === 'accepted' || quotation.status === 'expired')
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                aria-label="Edit"
                                            >
                                                <IoPencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quotation)}
                                                disabled={!isCateringQuotations && quotation.status === 'accepted'}
                                                className={`bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 transition-colors ${!isCateringQuotations && quotation.status === 'accepted'
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                aria-label="Delete"
                                            >
                                                <IoTrash className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>
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

export default QuotationsList