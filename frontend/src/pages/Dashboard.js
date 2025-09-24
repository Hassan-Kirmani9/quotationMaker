import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get } from '../../api/axios';
import { useCurrency } from '../../context/CurrencyContext';
import PageTitle from '../../components/Typography/PageTitle';
import { Button } from '@windmill/react-ui';
import {
    IoDocumentText,
    IoPeople,
    IoCart,
    IoTrendingUp,
    IoCheckmarkCircle,
    IoClock,
    IoEye,
    IoClose,
    IoAdd,
    IoArrowUp,
    IoArrowDown,
    IoCalendarOutline
} from 'react-icons/io5';

const Dashboard = () => {
    const history = useHistory();
    const { formatCurrency } = useCurrency();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState({
        quotations: { total: 0, recent: [] },
        clients: { total: 0, recent: [] },
        products: { total: 0, recent: [] },
        stats: {
            totalRevenue: 0,
            acceptedQuotations: 0,
            pendingQuotations: 0,
            conversionRate: 0
        }
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [quotationsRes, clientsRes, productsRes] = await Promise.all([
                get('/quotations?limit=5&page=1'),
                get('/clients?limit=5&page=1'),
                get('/products?limit=5&page=1')
            ]);

            const quotations = quotationsRes.success ? quotationsRes.data.quotations : [];
            const clients = clientsRes.success ? clientsRes.data.clients : [];
            const products = productsRes.success ? productsRes.data.products : [];

            
            const invoices = quotations.filter(q => q.status === 'invoice');
            const quotationStatus = quotations.filter(q => q.status === 'quotation');
            const totalRevenue = invoices.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
            const conversionRate = quotations.length > 0 ? (invoices.length / quotations.length) * 100 : 0;

            setDashboardData({
                quotations: {
                    total: quotationsRes.data?.pagination?.total || quotations.length,
                    recent: quotations
                },
                clients: {
                    total: clientsRes.data?.pagination?.total || clients.length,
                    recent: clients
                },
                products: {
                    total: productsRes.data?.pagination?.total || products.length,
                    recent: products
                },
                stats: {
                    totalRevenue,
                    acceptedQuotations: invoices.length,
                    pendingQuotations: quotationStatus.length,
                    conversionRate: Math.round(conversionRate)
                }
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? <IoArrowUp className="w-4 h-4 mr-1" /> : <IoArrowDown className="w-4 h-4 mr-1" />}
                            <span>{Math.abs(trend)}% from last month</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
        <button
            onClick={onClick}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left w-full group"
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
        </button>
    );

    const RecentItem = ({ title, subtitle, status, amount, date, onClick }) => (
        <div 
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={onClick}
        >
            <div className="flex-1">
                <h4 className="font-medium text-gray-900">{title}</h4>
                <p className="text-sm text-gray-600">{subtitle}</p>
                {date && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                        <IoCalendarOutline className="w-3 h-3 mr-1" />
                        {new Date(date).toLocaleDateString()}
                    </div>
                )}
            </div>
            <div className="text-right">
                {amount && (
                    <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
                )}
                {status && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'invoice' ? 'bg-green-100 text-green-800' :
                        status === 'quotation' ? 'bg-blue-100 text-blue-800' :
                        status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'viewed' ? 'bg-purple-100 text-purple-800' :
                        status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <Button
                        onClick={fetchDashboardData}
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <PageTitle>Dashboard</PageTitle>
                        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
                    </div>
                    <Button
                        onClick={() => history.push('/app/quotations/create')}
                        style={{ backgroundColor: "#AA1A21" }}
                        className="text-white"
                    >
                        <IoAdd className="w-4 h-4 mr-2" />
                        New Quotation
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(dashboardData.stats.totalRevenue)}
                        icon={IoTrendingUp}
                        color="bg-gradient-to-r from-green-500 to-green-600"
                    />
                    <MetricCard
                        title="Total Invoices"
                        value={dashboardData.stats.acceptedQuotations}
                        icon={IoCheckmarkCircle}
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                    <MetricCard
                        title="Pending Quotations"
                        value={dashboardData.stats.pendingQuotations}
                        icon={IoClock}
                        color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${dashboardData.stats.conversionRate}%`}
                        icon={IoTrendingUp}
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                    />
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <QuickAction
                            title="Create Quotation"
                            description="Start a new quotation for your client"
                            icon={IoDocumentText}
                            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
                            onClick={() => history.push('/app/quotations/create')}
                        />
                        <QuickAction
                            title="Add Client"
                            description="Register a new client in your system"
                            icon={IoPeople}
                            color="bg-gradient-to-r from-green-500 to-green-600"
                            onClick={() => history.push('/app/clients/create')}
                        />
                        <QuickAction
                            title="Add Product"
                            description="Add a new product to your catalog"
                            icon={IoCart}
                            color="bg-gradient-to-r from-purple-500 to-purple-600"
                            onClick={() => history.push('/app/products/create')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Quotations</h2>
                                <Button
                                    layout="link"
                                    onClick={() => history.push('/app/quotations')}
                                    className="text-indigo-600 hover:text-indigo-700"
                                >
                                    View All
                                </Button>
                            </div>
                        </div>
                        <div className="p-2">
                            {dashboardData.quotations.recent.length > 0 ? (
                                dashboardData.quotations.recent.map((quotation) => (
                                    <RecentItem
                                        key={quotation._id}
                                        title={quotation.quotationNo}
                                        subtitle={quotation.title}
                                        status={quotation.status}
                                        amount={quotation.totalAmount}
                                        date={quotation.createdAt}
                                        onClick={() => history.push(`/app/quotations/view/${quotation._id}`)}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <IoDocumentText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No quotations yet</p>
                                    <Button
                                        onClick={() => history.push('/app/quotations/create')}
                                        className="mt-3"
                                        style={{ backgroundColor: "#AA1A21" }}
                                    >
                                        Create First Quotation
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
                                <Button
                                    layout="link"
                                    onClick={() => history.push('/app/clients')}
                                    className="text-indigo-600 hover:text-indigo-700"
                                >
                                    View All
                                </Button>
                            </div>
                        </div>
                        <div className="p-2">
                            {dashboardData.clients.recent.length > 0 ? (
                                dashboardData.clients.recent.map((client) => (
                                    <RecentItem
                                        key={client._id}
                                        title={client.name}
                                        subtitle={client.businessName}
                                        date={client.createdAt}
                                        onClick={() => history.push('/app/clients')}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <IoPeople className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No clients yet</p>
                                    <Button
                                        onClick={() => history.push('/app/clients/create')}
                                        className="mt-3"
                                        style={{ backgroundColor: "#AA1A21" }}
                                    >
                                        Add First Client
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                        <IoDocumentText className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{dashboardData.quotations.total}</h3>
                        <p className="text-gray-600">Total Quotations</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                        <IoPeople className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{dashboardData.clients.total}</h3>
                        <p className="text-gray-600">Total Clients</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                        <IoCart className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{dashboardData.products.total}</h3>
                        <p className="text-gray-600">Total Products</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;