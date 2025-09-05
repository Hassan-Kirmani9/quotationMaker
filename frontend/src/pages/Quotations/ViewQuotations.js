import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { get, put } from '../../api/axios'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    Select,
    HelperText
} from '@windmill/react-ui'
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
    IoCopy
} from 'react-icons/io5'

import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext'
function ViewQuotations() {
    const history = useHistory()
    const { id } = useParams()
    const { currency, formatCurrency, getCurrencySymbol } = useCurrency()
    const [quotation, setQuotation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [statusForm, setStatusForm] = useState({
        status: ''
    })

    const statusOptions = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']

    const fetchQuotation = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await get(`/quotations/${id}`)

            if (response.success) {
                setQuotation(response.data.quotation)
            } else {
                setError('Failed to fetch quotation')
            }
        } catch (error) {
            setError('Failed to fetch quotation')
            console.error('Error fetching quotation:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadgeType = (status) => {
        switch (status) {
            case 'accepted': return 'success'
            case 'sent': return 'primary'
            case 'viewed': return 'primary'
            case 'draft': return 'neutral'
            case 'rejected': return 'danger'
            case 'expired': return 'warning'
            default: return 'neutral'
        }
    }

    const handleOpenStatusModal = () => {
        setStatusForm({ status: quotation.status })
        setShowStatusModal(true)
    }

    const handleCloseStatusModal = () => {
        setShowStatusModal(false)
        setStatusForm({ status: '' })
    }

    const handleStatusChange = (e) => {
        const { name, value } = e.target
        setStatusForm(prev => ({ ...prev, [name]: value }))
    }

    const handleUpdateStatus = async () => {
        if (!statusForm.status) {
            toast.error("Status is required.")
            return
        }

        try {
            const response = await put(`/quotations/${id}/status`, { status: statusForm.status })

            if (response.success) {
                toast.success("Status updated successfully!")
                fetchQuotation()
                handleCloseStatusModal()
            } else {
                toast.error(response.message || "Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error(error?.response?.data?.message || "Failed to update status")
        }
    }

    const handleDuplicateQuotation = async () => {
        if (window.confirm('Are you sure you want to duplicate this quotation?')) {
            try {
                const response = await post(`/quotations/${id}/duplicate`)

                if (response.success) {
                    toast.success("Quotation duplicated successfully!")
                    history.push('/app/quotations')
                } else {
                    toast.error(response.message || "Failed to duplicate quotation")
                }
            } catch (error) {
                console.error("Error duplicating quotation:", error)
                toast.error(error?.response?.data?.message || "Failed to duplicate quotation")
            }
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

    const calculateSubtotal = () => {
        return quotation.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0
    }

    const calculateDiscountAmount = () => {
        const subtotal = calculateSubtotal()
        return quotation.discountType === 'percentage'
            ? (subtotal * quotation.discountValue) / 100
            : quotation.discountValue || 0
    }

    const calculateTaxAmount = () => {
        const subtotal = calculateSubtotal()
        const discountAmount = calculateDiscountAmount()
        const afterDiscount = subtotal - discountAmount
        return (afterDiscount * quotation.taxRate) / 100 || 0
    }

    const calculateTotalAmount = () => {
        const subtotal = calculateSubtotal()
        const discountAmount = calculateDiscountAmount()
        const taxAmount = calculateTaxAmount()
        return subtotal - discountAmount + taxAmount
    }

    useEffect(() => {
        if (id) {
            fetchQuotation()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading quotation...</p>
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
                            onClick={fetchQuotation}
                            style={{ backgroundColor: "#AA1A21" }}
                            className="text-white"
                        >
                            Retry
                        </Button>
                        <Button
                            layout="outline"
                            onClick={() => history.push('/app/quotations')}
                        >
                            Back to Quotations
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!quotation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-4">Quotation not found</div>
                    <Button
                        layout="outline"
                        onClick={() => history.push('/app/quotations')}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">
                <div className="lg:col-span-2 space-y-6 mb-5">
                    <Card>
                        <CardBody>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                        {quotation.title}
                                    </h2>
                                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                        Quotation #{quotation.quotationNo}
                                    </p>
                                </div>

                                <div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date
                                        </h4>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                                            {formatDate(quotation.date)}
                                        </p>
                                    </div>
                                    {quotation.validUntil && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Valid Until
                                            </h4>
                                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                                                {formatDate(quotation.validUntil)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge type={getStatusBadgeType(quotation.status)} className="text-sm px-3 py-1">
                                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                    </Badge>

                                    <Button
                                        layout="link"
                                        size="icon"
                                        aria-label="Edit"
                                        onClick={() => history.push(`/app/quotations/edit/${quotation._id}`)}
                                    >
                                        <IoPencil className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </Button>
                                </div>
                            </div>

                            {quotation.description && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {quotation.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Client
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {quotation.client?.name || 'N/A'}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {quotation.client?.businessName || 'N/A'}
                                        </p>
                                        {quotation.client?.email && (
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {quotation.client.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Currency
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {quotation.currency || 'USD'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <SectionTitle>Quotation Items</SectionTitle>
                            <div className="overflow-x-auto mb-5">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                Product
                                            </th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                Description
                                            </th>
                                            <th className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                Quantity
                                            </th>
                                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                Unit Price
                                            </th>
                                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotation.items?.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                                                <td className="py-4 px-2 text-gray-800 dark:text-gray-200">
                                                    {item.product?.name || 'N/A'}
                                                </td>
                                                <td className="py-4 px-2 text-gray-600 dark:text-gray-400">
                                                    {item.description || 'N/A'}
                                                </td>
                                                <td className="py-4 px-2 text-center text-gray-800 dark:text-gray-200">
                                                    {item.quantity || 1}
                                                </td>
                                                <td className="py-4 px-2 text-right font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(item.unitPrice || 0)}                                                </td>
                                                <td className="py-4 px-2 text-right font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(item.totalPrice || 0)}                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>

                    {(quotation.notes || quotation.terms) && (
                        <Card>
                            <CardBody>
                                {quotation.terms && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Terms & Conditions
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {quotation.terms}
                                        </p>
                                    </div>
                                )}

                                {quotation.notes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notes
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                            {quotation.notes}
                                        </p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardBody>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Quotation Summary
                            </h3>

                            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                                        {formatCurrency(calculateSubtotal())}
                                    </span>
                                </div>

                                {quotation.discountValue > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Discount ({quotation.discountType === 'percentage' ? `${quotation.discountValue}%` : 'Fixed'})
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {formatCurrency(calculateDiscountAmount())}                                        </span>
                                    </div>
                                )}

                                {quotation.taxRate > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Tax ({quotation.taxRate}%)
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {formatCurrency(calculateTaxAmount())}                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-3 mt-3 flex justify-between items-center">
                                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        Total Amount
                                    </span>
                                    <span className="text-2xl font-bold" style={{ color: "#AA1A21" }}>
                                        {formatCurrency(calculateTotalAmount())}                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Actions
                            </h3>

                            <div className="space-y-3">
                                <Button
                                    style={{ backgroundColor: "#AA1A21" }}
                                    className="text-white w-full"
                                    onClick={handleOpenStatusModal}
                                >
                                    Update Status
                                </Button>

                                <Button
                                    style={{ backgroundColor: "#4CAF50" }}
                                    className="text-white w-full"
                                    onClick={handleDuplicateQuotation}
                                >
                                    <IoCopy className="w-4 h-4 mr-2" />
                                    Duplicate Quotation
                                </Button>

                                <Button
                                    block
                                    layout="outline"
                                    onClick={() => history.push('/app/quotations')}
                                >
                                    <IoArrowBack className="w-4 h-4 mr-2" />
                                    Back to All Quotations
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Status Update Modal */}
            <Modal isOpen={showStatusModal} onClose={handleCloseStatusModal}>
                <ModalHeader>Update Quotation Status</ModalHeader>
                <ModalBody>
                    <Label>
                        <span>Status</span>
                        <Select
                            name="status"
                            value={statusForm.status}
                            onChange={handleStatusChange}
                            className="mt-1"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </Select>
                    </Label>
                </ModalBody>
                <ModalFooter>
                    <Button layout="outline" onClick={handleCloseStatusModal}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStatus}>
                        Update Status
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default ViewQuotations