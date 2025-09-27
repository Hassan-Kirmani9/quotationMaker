import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { get, patch } from '../../api/axios'
import SectionTitle from '../../components/Typography/SectionTitle'
import {
    Button,
    Badge,
    Card,
    CardBody
} from '@windmill/react-ui'
import {
    IoArrowBack,
    IoPrint,
    IoPencil,
    IoCopy,
    IoChevronDown,
    IoChevronUp
} from 'react-icons/io5'

import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext'

function ViewCateringQuotation() {
    const history = useHistory()
    const { id } = useParams()
    const { currency, formatCurrency } = useCurrency()
    const [cateringQuotation, setCateringQuotation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [pdfLoading, setPdfLoading] = useState(false)
    const [expandedMenuItems, setExpandedMenuItems] = useState(false)
    const [expandedExtraItems, setExpandedExtraItems] = useState(false)
    const [expandedOtherItems, setExpandedOtherItems] = useState(false)

    const fetchCateringQuotation = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await get(`/catering-quotations/${id}`)

            if (response.success) {
                setCateringQuotation(response.data)
            } else {
                setError('Failed to fetch catering quotation')
            }
        } catch (error) {
            setError('Failed to fetch catering quotation')
            console.error('Error fetching catering quotation:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        const newStatus = cateringQuotation.status === 'quotation' ? 'invoice' : 'quotation'

        try {
            const response = await patch(`/catering-quotations/${id}/update-status`, { status: newStatus })

            if (response.success) {
                toast.success(`Status updated to ${newStatus} successfully!`)
                fetchCateringQuotation()
            } else {
                toast.error(response.message || "Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error(error?.response?.data?.message || "Failed to update status")
        }
    }
    const handleDownloadPDF = async () => {
        try {
            setPdfLoading(true)
            const response = await fetch(`https://backend-white-water-1093.fly.dev/api/catering-quotations/${id}/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `CQ-${cateringQuotation._id?.slice(-8).toUpperCase()}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success('PDF downloaded successfully!')
            } else {
                const errorText = await response.text()
                console.error('PDF generation failed:', errorText)
                toast.error('Failed to download PDF')
            }
        } catch (error) {
            console.error('Error downloading PDF:', error)
            toast.error('Failed to download PDF')
        } finally {
            setPdfLoading(false)
        }
    }
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const toggleMenuItems = () => {
        setExpandedMenuItems(!expandedMenuItems)
    }

    const toggleExtraItems = () => {
        setExpandedExtraItems(!expandedExtraItems)
    }

    const toggleOtherItems = () => {
        setExpandedOtherItems(!expandedOtherItems)
    }

    useEffect(() => {
        if (id) {
            fetchCateringQuotation()
        }
    }, [id])

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
                    <div className="space-x-4">
                        <Button
                            onClick={fetchCateringQuotation}
                            style={{ backgroundColor: "#AA1A21" }}
                            className="text-white"
                        >
                            Retry
                        </Button>
                        <Button
                            layout="outline"
                            onClick={() => history.push('/app/catering-quotations')}
                        >
                            Back to Quotations
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!cateringQuotation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-4">Quotation not found</div>
                    <Button
                        layout="outline"
                        onClick={() => history.push('/app/catering-quotations')}
                    >
                        Back to Quotations
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-5">
                <div className="lg:col-span-2 space-y-6 mb-5">
                    <Card>
                        <CardBody>
                            <div className="mb-6">
                                <div className="mb-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
                                            Quotation
                                        </h2>
                                        <Button
                                            layout="link"
                                            size="icon"
                                            aria-label="Edit"
                                            onClick={() => history.push(`/app/catering-quotations/edit/${cateringQuotation._id}`)}
                                            style={{ minWidth: '40px', minHeight: '40px', padding: '8px' }}
                                        >
                                            <IoPencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                        </Button>
                                    </div>
                                    <p className="text-sm lg:text-base font-semibold text-gray-600 dark:text-gray-400">
                                        #{cateringQuotation._id?.slice(-8).toUpperCase() || 'N/A'}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <div className="flex-1">
                                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date
                                        </h4>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {formatDate(cateringQuotation.createdAt)}
                                        </p>
                                    </div>
                                </div>

                              
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Client
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {cateringQuotation.client?.name || 'N/A'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {cateringQuotation.client?.businessName || 'N/A'}
                                    </p>
                                    {cateringQuotation.client?.email && (
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {cateringQuotation.client.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <SectionTitle>Menu Section</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Per Thaal Rate
                                    </h4>
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {formatCurrency(cateringQuotation.menu?.perThaalRate || 0)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Number of Thaals
                                    </h4>
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {cateringQuotation.menu?.numberOfThaals || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Menu Total
                                    </h4>
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {formatCurrency(cateringQuotation.menu?.total || 0)}
                                    </p>
                                </div>
                            </div>

                            {cateringQuotation.menu?.items && cateringQuotation.menu.items.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu Items</h4>
                                        <button
                                            onClick={toggleMenuItems}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            {expandedMenuItems ? (
                                                <>
                                                    Collapse <IoChevronUp className="w-4 h-4 ml-1 dark:text-gray-400" />
                                                </>
                                            ) : (
                                                <>
                                                    Expand <IoChevronDown className="w-4 h-4 ml-1 dark:text-gray-400" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {expandedMenuItems && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                                        <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                            Item Name
                                                        </th>
                                                        <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                            Amount
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cateringQuotation.menu.items.map((item, index) => (
                                                        <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                                                            <td className="py-3 px-2 text-gray-800 dark:text-gray-200">
                                                                {item.name || 'N/A'}
                                                            </td>
                                                            <td className="py-3 px-2 text-right font-medium text-gray-800 dark:text-gray-200">
                                                                {item.amount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {cateringQuotation.extras?.items && cateringQuotation.extras.items.length > 0 && (
                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-4">
                                    <SectionTitle>Extra Items</SectionTitle>
                                    <button
                                        onClick={toggleExtraItems}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        {expandedExtraItems ? (
                                            <>
                                                Collapse <IoChevronUp className="w-4 h-4 ml-1 dark:text-gray-400" />
                                            </>
                                        ) : (
                                            <>
                                                Expand <IoChevronDown className="w-4 h-4 ml-1 dark:text-gray-400" />
                                            </>
                                        )}
                                    </button>
                                </div>
                                {expandedExtraItems && (
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                        Item Name
                                                    </th>
                                                    <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cateringQuotation.extras.items.map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                                                        <td className="py-3 px-2 text-gray-800 dark:text-gray-200">
                                                            {item.name || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-2 text-right font-medium text-gray-800 dark:text-gray-200">
                                                            {item.amount}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Extras Total: {formatCurrency(cateringQuotation.extras?.total || 0)}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {cateringQuotation.others?.items && cateringQuotation.others.items.length > 0 && (
                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between mb-4">
                                    <SectionTitle>Other Items</SectionTitle>
                                    <button
                                        onClick={toggleOtherItems}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        {expandedOtherItems ? (
                                            <>
                                                Collapse <IoChevronUp className="w-4 h-4 ml-1 dark:text-gray-400" />
                                            </>
                                        ) : (
                                            <>
                                                Expand <IoChevronDown className="w-4 h-4 ml-1 dark:text-gray-400" />
                                            </>
                                        )}
                                    </button>
                                </div>
                                {expandedOtherItems && (
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                        Item Name
                                                    </th>
                                                    <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cateringQuotation.others.items.map((item, index) => (
                                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                                                        <td className="py-3 px-2 text-gray-800 dark:text-gray-200">
                                                            {item.name || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-2 text-right font-medium text-gray-800 dark:text-gray-200">
                                                            {item.amount}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Others Total: {formatCurrency(cateringQuotation.others?.total || 0)}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardBody>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Costing Summary
                            </h3>

                            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600 text-xs lg:text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                        {formatCurrency(cateringQuotation.costing?.total || 0)}
                                    </span>
                                </div>

                                {cateringQuotation.costing?.discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Discount
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {formatCurrency(cateringQuotation.costing.discount)}
                                        </span>
                                    </div>
                                )}

                                {cateringQuotation.costing?.advance > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Advance
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {formatCurrency(cateringQuotation.costing.advance)}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-3 mt-3 flex justify-between items-center">
                                    <span className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        Grand Total
                                    </span>
                                    <span className="text-xl lg:text-2xl font-bold" style={{ color: "#AA1A21" }}>
                                        {formatCurrency(cateringQuotation.costing?.grandTotal || 0)}
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Actions
                            </h3>
                            <div className="space-y-3 lg:space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Status
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {cateringQuotation.status === 'quotation' ? 'Click to convert to Invoice' : 'Click to convert to Quotation'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: cateringQuotation.status === 'quotation' ? '#3B82F6' : '#9CA3AF'
                                        }}>
                                            Quotation
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleToggleStatus}
                                            style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                width: '44px',
                                                height: '24px',
                                                backgroundColor: cateringQuotation.status === 'invoice' ? '#3B82F6' : '#E5E7EB',
                                                borderRadius: '12px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s ease',
                                                outline: 'none'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: cateringQuotation.status === 'invoice' ? '22px' : '2px',
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '50%',
                                                    transition: 'left 0.2s ease',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            />
                                        </button>

                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: cateringQuotation.status === 'invoice' ? '#3B82F6' : '#9CA3AF'
                                        }}>
                                            Invoice
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    block
                                    layout="outline"
                                    onClick={() => history.push('/app/catering-quotations')}
                                >
                                    <IoArrowBack className="w-4 h-4 mr-2" />
                                    Back to All Quotations
                                </Button>
                                <Button
                                    block
                                    style={{ backgroundColor: "#AA1A21" }}
                                    className="text-white"
                                    onClick={handleDownloadPDF}
                                    disabled={pdfLoading}
                                >
                                    {pdfLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <IoPrint className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default ViewCateringQuotation