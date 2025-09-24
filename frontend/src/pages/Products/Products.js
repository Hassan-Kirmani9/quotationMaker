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
    Button,
    Pagination,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    HelperText,
    Select
} from '@windmill/react-ui'
import { EditIcon, TrashIcon } from '../../icons'
import { useCurrency } from '../../context/CurrencyContext'
import {
    IoCart,
    IoDocument,
    IoPricetag,
    IoPricetagsOutline,
    IoPencil,
    IoTrash,
    IoResize
} from 'react-icons/io5'

function Products() {
    const history = useHistory()
    const { formatCurrency, currency } = useCurrency()

    const [pageTable, setPageTable] = useState(1)
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [searchTerm, setSearchTerm] = useState('')

    const [sizes, setSizes] = useState([])
    const [loadingSizes, setLoadingSizes] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        sellingPrice: 0,
        purchasePrice: 0,
        size: ''
    })
    const [editLoading, setEditLoading] = useState(false)
    const [editErrors, setEditErrors] = useState({})
    const [editApiError, setEditApiError] = useState('')

    const fetchSizes = async () => {
        try {
            setLoadingSizes(true)
            const response = await get('/sizes/dropdown')
            if (response.success) {
                setSizes(response.data)
            }
        } catch (error) {
            console.error('Error fetching sizes:', error)
        } finally {
            setLoadingSizes(false)
        }
    }

    const fetchProducts = async (page = 1, search = '') => {
        try {
            setLoading(true)
            setError('')

            const params = new URLSearchParams({
                page: page.toString(),
                limit: resultsPerPage.toString()
            })

            if (search) params.append('search', search)

            const response = await get(`/products?${params.toString()}`)

            if (response.success) {
                setDataTable(response.data.products)
                setTotalResults(response.data.pagination.total)
                setTotalPages(response.data.pagination.pages)
            } else {
                setError(response.message || 'Failed to fetch products')
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch products')
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        setPageTable(1)

        const timeoutId = setTimeout(() => {
            fetchProducts(1, value)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const handleDelete = async (id, productName) => {
        if (window.confirm(`Are you sure you want to delete ${productName}? This action cannot be undone.`)) {
            try {
                const response = await _delete(`/products/${id}`)

                if (response.success) {
                    fetchProducts(pageTable, searchTerm)
                    alert('Product deleted successfully')
                } else {
                    alert(response.message || 'Failed to delete product')
                }
            } catch (error) {
                alert(error.response?.data?.message || error.message || 'Failed to delete product')
                console.error('Error deleting product:', error)
            }
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setEditFormData({
            name: product.name,
            sellingPrice: product.sellingPrice,
            purchasePrice: product.purchasePrice,
            size: product.size._id || product.size
        })
        setEditErrors({})
        setEditApiError('')
        setIsModalOpen(true)

        if (sizes.length === 0) {
            fetchSizes()
        }
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: name === 'sellingPrice' || name === 'purchasePrice' ? parseFloat(value) || 0 : value
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
            newErrors.name = 'Product name is required'
        }

        if (!editFormData.size) {
            newErrors.size = 'Size is required'
        }

        if (!editFormData.sellingPrice || editFormData.sellingPrice < 0) {
            newErrors.sellingPrice = 'Selling price must be 0 or greater'
        }

        if (!editFormData.purchasePrice || editFormData.purchasePrice < 0) {
            newErrors.purchasePrice = 'Purchase price must be 0 or greater'
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
            const response = await put(`/products/${editingProduct._id}`, editFormData)

            if (response.success) {
                alert('Product updated successfully!')
                closeModal()
                fetchProducts(pageTable, searchTerm)
            } else {
                setEditApiError(response.message || 'Failed to update product. Please try again.')
            }
        } catch (error) {
            console.error('Error updating product:', error)

            if (error.response?.data?.message) {
                setEditApiError(error.response.data.message)
            } else if (error.message) {
                setEditApiError(error.message)
            } else {
                setEditApiError('Failed to update product. Please check your connection and try again.')
            }
        } finally {
            setEditLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingProduct(null)
        setEditFormData({
            name: '',
            sellingPrice: 0,
            purchasePrice: 0,
            size: ''
        })
        setEditErrors({})
        setEditApiError('')
    }

    const onPageChange = (p) => {
        setPageTable(p)
        fetchProducts(p, searchTerm)
    }

    useEffect(() => {
        fetchProducts(1, '')
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
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
                        onClick={() => fetchProducts(1, '')}
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
                <PageTitle>Products</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={() => history.push('/app/products/create')}
                >
                    Add Product
                </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <Input
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-1/3"
                />
            </div>

            {dataTable.length === 0 && !searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No products found</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={() => history.push('/app/products/create')}
                    >
                        Create Your First Product
                    </Button>
                </div>
            ) : dataTable.length === 0 && searchTerm ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No products found for "{searchTerm}"</p>
                    <Button
                        layout="outline"
                        onClick={() => {
                            setSearchTerm('')
                            fetchProducts(1, '')
                        }}
                    >
                        Clear Search
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <TableContainer className="mb-8">
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell>Purchase Price</TableCell>
                                        <TableCell>Selling Price</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {dataTable.map((product) => (
                                        <TableRow key={product._id}>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <div>
                                                        <p className="font-semibold">{product.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {product.size?.name || 'N/A'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm">{formatCurrency(product.purchasePrice)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{formatCurrency(product.sellingPrice)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-4">
                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Edit"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                                                    </Button>

                                                    <Button
                                                        layout="link"
                                                        size="icon"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(product._id, product.name)}
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

                    {/* Mobile Card View */}
                    <div className="block md:hidden">
                        <div className="space-y-4 mb-8">
                            {dataTable.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm border border-purple-200 relative"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-gray-800 font-semibold text-lg leading-tight flex-1 pr-4">
                                            {product.name}
                                        </h3>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                                aria-label="Edit"
                                            >
                                                <IoPencil className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id, product.name)}
                                                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                                                aria-label="Delete"
                                            >
                                                <IoTrash className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div className="flex items-center mb-3 text-gray-600">
                                        <IoResize className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {product.size?.name || 'No size'}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {product.description && (
                                        <div className="flex items-start mb-4 text-gray-600">
                                            <IoDocument className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">
                                                {product.description}
                                            </span>
                                        </div>
                                    )}

                                    {/* Purchase Price */}
                                    <div className="flex items-center mb-3 text-gray-600">
                                        <IoPricetagsOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <div className="text-sm">
                                            <span className="text-gray-500">Purchase Price: </span>
                                            <span className="font-medium">{formatCurrency(product.purchasePrice)}</span>
                                        </div>
                                    </div>

                                    {/* Selling Price */}
                                    <div className="flex items-center">
                                        <IoPricetag className="w-5 h-5 mr-3 text-purple-600" />
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Selling Price</div>
                                            <div className="text-2xl font-bold text-purple-700">
                                                {formatCurrency(product.sellingPrice)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Pagination */}
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

            {/* Edit Product Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalHeader>Edit Product</ModalHeader>
                <ModalBody className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleEditSubmit}>
                        {editApiError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {editApiError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            <Label>
                                <span>Product Name *</span>
                                <Input
                                    className="mt-1"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter product name"
                                    required
                                    valid={!editErrors.name}
                                />
                                {editErrors.name && (
                                    <HelperText valid={false}>{editErrors.name}</HelperText>
                                )}
                            </Label>



                            <Label>
                                <span>Size *</span>
                                {loadingSizes ? (
                                    <div className="mt-1 p-2 text-gray-500">Loading sizes...</div>
                                ) : (
                                    <Select
                                        className="mt-1"
                                        name="size"
                                        value={editFormData.size}
                                        onChange={handleEditInputChange}
                                        required
                                        valid={!editErrors.size}
                                    >
                                        <option value="">Select a size</option>
                                        {sizes.map((size) => (
                                            <option key={size._id} value={size._id}>
                                                {size.name}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                                {editErrors.size && (
                                    <HelperText valid={false}>{editErrors.size}</HelperText>
                                )}
                            </Label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Label>
                                    <span>Purchase Price *</span>
                                    <Input
                                        className="mt-1"
                                        name="purchasePrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editFormData.purchasePrice}
                                        onChange={handleEditInputChange}
                                        placeholder="0.00"
                                        required
                                        valid={!editErrors.purchasePrice}
                                    />
                                    {editErrors.purchasePrice && (
                                        <HelperText valid={false}>{editErrors.purchasePrice}</HelperText>
                                    )}
                                </Label>

                                <Label>
                                    <span>Selling Price *</span>
                                    <Input
                                        className="mt-1"
                                        name="sellingPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editFormData.sellingPrice}
                                        onChange={handleEditInputChange}
                                        placeholder="0.00"
                                        required
                                        valid={!editErrors.sellingPrice}
                                    />
                                    {editErrors.sellingPrice && (
                                        <HelperText valid={false}>{editErrors.sellingPrice}</HelperText>
                                    )}
                                </Label>
                            </div>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter className="flex-shrink-0">
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
                            {editLoading ? 'Updating...' : 'Update Product'}
                        </Button>
                    </div>
                    <div className="block w-full sm:hidden">
                        <Button block size="large" layout="outline" onClick={closeModal} disabled={editLoading}>
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
                            {editLoading ? 'Updating...' : 'Update Product'}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default Products