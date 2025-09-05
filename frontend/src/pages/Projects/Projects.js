import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { get, _delete, put } from '../../api/axios'

import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
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
    Textarea,
    HelperText
} from '@windmill/react-ui'
import { EditIcon, TrashIcon } from '../../icons'
import CTA from '../../components/CTA'

function Projects() {
    const history = useHistory()

    
    const [pageTable, setPageTable] = useState(1)

    
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    
    const resultsPerPage = 10
    const [totalResults, setTotalResults] = useState(0)

    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        client: ''
    })
    const [editLoading, setEditLoading] = useState(false)
    const [editErrors, setEditErrors] = useState({})
    const [editApiError, setEditApiError] = useState('')
    const [clientsList, setClientsList] = useState([])
    const [clientsLoading, setClientsLoading] = useState(false)

    
    const fetchProjects = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await get("/projects")

            if (response.success) {
                setDataTable(response.data)
                setTotalResults(response.data.length)
            } else {
                setError('Failed to fetch projects')
            }
        } catch (error) {
            setError('Failed to fetch projects')
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }


    
    const handleDelete = async (id, projectName) => {
        if (window.confirm(`Are you sure you want to delete ${projectName}? This action cannot be undone.`)) {
            try {
                const response = await _delete(`/projects/${id}`)

                if (response.success) {
                    fetchProjects() 
                    alert('Project deleted successfully')
                } else {
                    alert('Failed to delete project')
                }
            } catch (error) {
                alert('Failed to delete project')
                console.error('Error deleting project:', error)
            }
        }
    }

    
    const handleEdit = async (project) => {
        setEditingProject(project)
        setEditFormData({
            name: project.name,
            description: project.description,
            client: project.client ? project.client._id : ''
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
            newErrors.name = 'Project name is required'
        }

        if (!editFormData.description.trim()) {
            newErrors.description = 'Description is required'
        }

        if (!editFormData.client.trim()) {
            newErrors.client = 'Client is required'
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
            const response = await put(`/projects/${editingProject._id}`, editFormData)

            if (response.success) {
                alert('Project updated successfully!')
                closeModal()
                fetchProjects() 
            } else {
                setEditApiError('Failed to update project. Please try again.')
            }
        } catch (error) {
            console.error('Error updating project:', error)

            
            if (error.errors) {
                
                const backendErrors = {}
                Object.keys(error.errors).forEach(key => {
                    backendErrors[key] = error.errors[key]
                })
                setEditErrors(backendErrors)
            } else if (error.message) {
                setEditApiError(error.message)
            } else {
                setEditApiError('Failed to update project. Please check your connection and try again.')
            }
        } finally {
            setEditLoading(false)
        }
    }

    
    const closeModal = () => {
        setIsModalOpen(false)
        setEditingProject(null)
        setEditFormData({
            name: '',
            description: '',
            client: ''
        })
        setEditErrors({})
        setEditApiError('')
    }

    
    function onPageChange(p) {
        setPageTable(p)
    }

    
    const getPaginatedData = () => {
        const startIndex = (pageTable - 1) * resultsPerPage
        const endIndex = startIndex + resultsPerPage
        return dataTable.slice(startIndex, endIndex)
    }

    
    useEffect(() => {
        fetchProjects()
    }, [])

    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading projects...</p>
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
                        onClick={fetchProjects}
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
                <PageTitle>Projects</PageTitle>
                <Button
                    style={{ backgroundColor: "#AA1A21" }}
                    className="text-white"
                    onClick={() => history.push('/app/projects/create')}
                >
                    Add Project
                </Button>
            </div>

            {dataTable.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No projects found</p>
                    <Button
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                        onClick={() => history.push('/app/projects/create')}
                    >
                        Create Your First Project
                    </Button>
                </div>
            ) : (
                <TableContainer className="mb-8">
                    <Table>
                        <TableHeader>
                            <tr>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Base Currency</TableCell>

                                <TableCell>Actions</TableCell>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {getPaginatedData().map((project) => (
                                <TableRow key={project._id}>
                                    <TableCell>
                                        <div className="flex items-center text-sm">
                                            <div>
                                                <p className="font-semibold">{project.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{project.description}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {project.client ? project.client.name : 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {project.currency ? project.currency.currency : 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-4">
                                            <Button
                                                layout="link"
                                                size="icon"
                                                aria-label="Edit"
                                                onClick={() => history.push(`/app/projects/edit/${project._id}`)}
                                            >
                                                <EditIcon className="w-5 h-5" aria-hidden="true" />
                                            </Button>
                                            <Button
                                                layout="link"
                                                size="icon"
                                                aria-label="Delete"
                                                onClick={() => handleDelete(project._id, project.name)}
                                            >
                                                <TrashIcon className="w-5 h-5" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TableFooter>
                        <Pagination
                            totalResults={totalResults}
                            resultsPerPage={resultsPerPage}
                            onChange={onPageChange}
                            label="Table navigation"
                        />
                    </TableFooter>
                </TableContainer>
            )}
        </>
    )
}

export default Projects