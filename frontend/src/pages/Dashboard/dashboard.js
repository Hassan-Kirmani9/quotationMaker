import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get } from '../../api/axios';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import PageTitle from '../../components/Typography/PageTitle';
import { Button } from '@windmill/react-ui';
import {
    IoDocumentText,
    IoPeople,
    IoCart,
    IoTrendingUp,
    IoCheckmarkCircle,
    IoAdd,
    IoArrowUp,
    IoArrowDown,
    IoCalendarOutline,
    IoPersonCircleOutline,
    IoLogOutOutline,
    IoContrastOutline,
    IoChevronForward
} from 'react-icons/io5';
import { FaRegClock } from "react-icons/fa";

import { ChartsIcon, MoneyIcon, PeopleIcon } from '../../icons';

const Dashboard = () => {
    const history = useHistory();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
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

    const isCateringOnly = () => {
        if (!user?.permissions) return false;
        const permissions = user.permissions;
        const hasCateringQuotations = permissions.includes('/catering-quotations');
        const hasRegularQuotations = permissions.includes('/quotations');
        const hasProducts = permissions.includes('/products');
        const hasSizes = permissions.includes('/sizes');

        return hasCateringQuotations && !hasRegularQuotations && !hasProducts && !hasSizes;
    };

    const hasPermission = (permission) => {
        if (!user?.permissions) return false;
        if (permission === '/catering-quotations') {
            return user.permissions.includes('/catering-quotations') || user.permissions.includes('cateringQuotations');
        }
        return user.permissions.includes(permission);
    };

    const getQuotationsEndpoint = () => {
        return isCateringOnly() ? '/catering-quotations' : '/quotations';
    };

    const getQuotationsRoute = () => {
        return isCateringOnly() ? '/app/catering-quotations' : '/app/quotations';
    };

    const getQuotationCreateRoute = () => {
        return isCateringOnly() ? '/app/catering-quotations/create' : '/app/quotations/create';
    };

    const getQuotationViewRoute = (id) => {
        return isCateringOnly() ? `/app/catering-quotations/view/${id}` : `/app/quotations/view/${id}`;
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const promises = [];
            const quotationsEndpoint = getQuotationsEndpoint();

            promises.push(get(`${quotationsEndpoint}?limit=5&page=1`));

            if (hasPermission('/clients')) {
                promises.push(get('/clients?limit=5&page=1'));
            } else {
                promises.push(Promise.resolve({ success: true, data: { clients: [], pagination: { total: 0 } } }));
            }

            if (hasPermission('/products')) {
                promises.push(get('/products?limit=5&page=1'));
            } else {
                promises.push(Promise.resolve({ success: true, data: { products: [], pagination: { total: 0 } } }));
            }

            const [quotationsRes, clientsRes, productsRes] = await Promise.all(promises);

            const quotationsKey = isCateringOnly() ? 'cateringQuotations' : 'quotations';
            const quotations = quotationsRes.success ? (quotationsRes.data[quotationsKey] || quotationsRes.data.quotations || []) : [];
            const clients = clientsRes.success ? clientsRes.data.clients : [];
            const products = productsRes.success ? productsRes.data.products : [];

            const invoices = quotations.filter(q => q.status === 'invoice');
            const quotationStatus = quotations.filter(q => q.status === 'quotation');
            const totalRevenue = invoices.reduce((sum, q) => {
                if (isCateringOnly()) {
                    return sum + (q.costing?.grandTotal || 0);
                }
                return sum + (q.totalAmount || 0);
            }, 0);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'invoice':
                return '#10B981';
            case 'quotation':
                return '#3B82F6';
            case 'sent':
                return '#F59E0B';
            case 'viewed':
                return '#8B5CF6';
            case 'draft':
                return '#6B7280';
            default:
                return '#EF4444';
        }
    };
    const formatRevenueDisplay = (amount) => {
        const formatted = formatCurrency(amount);
        // Remove .00 from the end if present
        return formatted.replace(/\.00$/, '');
    }
    const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trend > 0 ? <IoArrowUp className="w-4 h-4 mr-1" /> : <IoArrowDown className="w-4 h-4 mr-1" />}
                            <span>{Math.abs(trend)}% from last month</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
        <button
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left w-full group"
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 dark:text-white text-black" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
            </div>
        </button>
    );

    const RecentItem = ({ title, subtitle, status, amount, date, onClick }) => (
        <div
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            onClick={onClick}
        >
            <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
                {date && (
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <IoCalendarOutline className="w-3 h-3 mr-1" />
                        {new Date(date).toLocaleDateString()}
                    </div>
                )}
            </div>
            <div className="text-right">
                {amount && (
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
                )}
                {status && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status === 'invoice' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        status === 'quotation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                            status === 'sent' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                status === 'viewed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                                    status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100' :
                                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
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

    const renderQuickActions = () => {
        const actions = [];

        if (hasPermission('/quotations') || hasPermission('/catering-quotations')) {
            actions.push(
                <QuickAction
                    key="quotation"
                    title={isCateringOnly() ? "Create Quotation" : "Create Quotation"}
                    description={isCateringOnly() ? "Start a new Quotation for your client" : "Start a new quotation for your client"}
                    icon={IoDocumentText}
                    color="bg-gradient-to-r from-indigo-500 to-indigo-600"
                    onClick={() => history.push(getQuotationCreateRoute())}
                />
            );
        }

        if (hasPermission('/clients')) {
            actions.push(
                <QuickAction
                    key="client"
                    title="Add Client"
                    description="Register a new client in your system"
                    icon={IoPeople}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    onClick={() => history.push('/app/clients/create')}
                />
            );
        }

        if (hasPermission('/products')) {
            actions.push(
                <QuickAction
                    key="product"
                    title="Add Product"
                    description="Add a new product to your catalog"
                    icon={IoCart}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                    onClick={() => history.push('/app/products/create')}
                />
            );
        }

        return actions;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" >
            <div
                style={{
                    display: window.innerWidth < 768 ? 'grid' : 'none',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    padding: '16px'
                }}
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
<p className="text-sm font-bold text-gray-900 dark:text-white">{formatRevenueDisplay(dashboardData.stats.totalRevenue)}</p>                        </div>
                        <div style={{ width: '30px', height: '30px', backgroundColor: '#10B981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IoTrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Invoices</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{dashboardData.stats.acceptedQuotations}</p>
                        </div>
                        <div style={{ width: '30px', height: '30px', backgroundColor: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IoCheckmarkCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{isCateringOnly() ? "Pending Quotations" : "Pending Quotations"}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{dashboardData.stats.pendingQuotations}</p>
                        </div>
                        <div style={{ width: '30px', height: '30px', backgroundColor: '#F59E0B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaRegClock style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Conversion Rate</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{dashboardData.stats.conversionRate}%</p>
                        </div>
                        <div style={{ width: '30px', height: '30px', backgroundColor: '#8B5CF6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IoTrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: window.innerWidth < 768 ? 'block' : 'none',
                    padding: '0 16px',
                    marginBottom: '24px'
                }}
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {renderQuickActions().map((action, index) => (
                        <button
                            key={index}
                            onClick={action.props.onClick}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 text-left w-full border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: action.props.icon === IoDocumentText ? "#6366F1" : action.props.icon === IoPeople ? "#10B981" : "#8B5CF6"
                                }}>
                                    <action.props.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{action.props.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{action.props.description}</p>
                                </div>
                                <IoChevronForward className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div
                style={{
                    display: window.innerWidth < 768 ? 'flex' : 'none',
                    flexDirection: 'column',
                    gap: '24px',
                    padding: '0 16px',
                    marginBottom: '24px'
                }}
            >
                {(hasPermission('/quotations') || hasPermission('/catering-quotations')) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isCateringOnly() ? "Recent Quotations" : "Recent Quotations"}
                                </h2>
                                <Button
                                    layout="link"
                                    onClick={() => history.push(getQuotationsRoute())}
                                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    style={{ fontSize: '14px' }}
                                >
                                    View All
                                </Button>
                            </div>
                        </div>
                        <div>
                            {dashboardData.quotations.recent.length > 0 ? (
                                dashboardData.quotations.recent.map((quotation, index) => (
                                    <div
                                        key={quotation._id}
                                        onClick={() => history.push(getQuotationViewRoute(quotation._id))}
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                        style={{
                                            borderBottom: index === dashboardData.quotations.recent.length - 1 ? 'none' : '1px solid'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                {quotation.quotationNo || `${isCateringOnly() ? 'Catering' : ''} Quotation`}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                                                {quotation.title || quotation.client?.name}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <IoCalendarOutline className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(quotation.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                {formatCurrency(isCateringOnly() ? quotation.costing?.grandTotal : quotation.totalAmount)}
                                            </p>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    color: 'white',
                                                    backgroundColor: getStatusColor(quotation.status)
                                                }}
                                            >
                                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '32px', textAlign: 'center' }}>
                                    <IoDocumentText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
                                        {isCateringOnly() ? "No Quotations yet" : "No quotations yet"}
                                    </p>
                                    <Button
                                        onClick={() => history.push(getQuotationCreateRoute())}
                                        style={{ backgroundColor: "#AA1A21", color: 'white', fontSize: '14px', fontWeight: '600' }}
                                    >
                                        {isCateringOnly() ? "Create First Quotation" : "Create First Quotation"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasPermission('/clients') && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Clients</h2>
                                <Button
                                    layout="link"
                                    onClick={() => history.push('/app/clients')}
                                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    style={{ fontSize: '14px' }}
                                >
                                    View All
                                </Button>
                            </div>
                        </div>
                        <div>
                            {dashboardData.clients.recent.length > 0 ? (
                                dashboardData.clients.recent.map((client, index) => (
                                    <div
                                        key={client._id}
                                        onClick={() => history.push('/app/clients')}
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                        style={{
                                            borderBottom: index === dashboardData.clients.recent.length - 1 ? 'none' : '1px solid'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                                                {client.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                                {client.businessName || "N/A"}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <IoCalendarOutline className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(client.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '32px', textAlign: 'center' }}>
                                    <IoPeople className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-base text-gray-500 dark:text-gray-400 mb-4">No clients yet</p>
                                    <Button
                                        onClick={() => history.push('/app/clients/create')}
                                        style={{ backgroundColor: "#AA1A21", color: 'white', fontSize: '14px', fontWeight: '600' }}
                                    >
                                        Add First Client
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div
                style={{
                    display: window.innerWidth < 768 ? 'grid' : 'none',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    padding: '0 16px',
                    marginBottom: '100px'
                }}
            >
                {(hasPermission('/quotations') || hasPermission('/catering-quotations')) && (
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center cursor-pointer shadow-sm"
                        onClick={() => history.push(getQuotationsRoute())}
                    >
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#6366F120', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <ChartsIcon style={{ width: '24px', height: '24px', color: '#6366F1' }} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.quotations.total}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                            {isCateringOnly() ? "Total Quotations" : "Total Quotations"}
                        </p>
                    </div>
                )}

                {hasPermission('/clients') && (
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center cursor-pointer shadow-sm"
                        onClick={() => history.push('/app/clients')}
                    >
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#10B98120', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <PeopleIcon style={{ width: '24px', height: '24px', color: '#10B981' }} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.clients.total}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Total Clients</p>
                    </div>
                )}

                {hasPermission('/products') && (
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center cursor-pointer shadow-sm"
                        onClick={() => history.push('/app/products')}
                    >
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#8B5CF620', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <MoneyIcon style={{ width: '24px', height: '24px', color: '#8B5CF6' }} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.products.total}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Total Products</p>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-8" style={{ display: window.innerWidth < 768 ? 'none' : 'block' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <PageTitle>Dashboard</PageTitle>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your business.</p>
                    </div>
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
                        title={isCateringOnly() ? "Pending Quotations" : "Pending Quotations"}
                        value={dashboardData.stats.pendingQuotations}
                        icon={FaRegClock}
                        color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${dashboardData.stats.conversionRate}%`}
                        icon={IoTrendingUp}
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                    />
                </div>

                {renderQuickActions().length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderQuickActions()}
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-1 ${hasPermission('/clients') ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
                    {(hasPermission('/quotations') || hasPermission('/catering-quotations')) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {isCateringOnly() ? "Recent Quotations" : "Recent Quotations"}
                                    </h2>
                                    <Button
                                        layout="link"
                                        onClick={() => history.push(getQuotationsRoute())}
                                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                                            title={quotation.quotationNo || `${isCateringOnly() ? 'Catering' : ''} Quotation`}
                                            subtitle={quotation.title || quotation.client?.name}
                                            status={quotation.status}
                                            amount={isCateringOnly() ? quotation.costing?.grandTotal : quotation.totalAmount}
                                            date={quotation.createdAt}
                                            onClick={() => history.push(getQuotationViewRoute(quotation._id))}
                                        />
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <IoDocumentText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {isCateringOnly() ? "No Quotations yet" : "No quotations yet"}
                                        </p>
                                        <Button
                                            onClick={() => history.push(getQuotationCreateRoute())}
                                            className="mt-3"
                                            style={{ backgroundColor: "#AA1A21" }}
                                        >
                                            {isCateringOnly() ? "Create First Quotation" : "Create First Quotation"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {hasPermission('/clients') && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Clients</h2>
                                    <Button
                                        layout="link"
                                        onClick={() => history.push('/app/clients')}
                                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                                        <IoPeople className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">No clients yet</p>
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
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {(hasPermission('/quotations') || hasPermission('/catering-quotations')) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <ChartsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.quotations.total}</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {isCateringOnly() ? "Total Quotations" : "Total Quotations"}
                            </p>
                        </div>
                    )}

                    {hasPermission('/clients') && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <PeopleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.clients.total}</h3>
                            <p className="text-gray-600 dark:text-gray-300">Total Clients</p>
                        </div>
                    )}

                    {hasPermission('/products') && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <MoneyIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.products.total}</h3>
                            <p className="text-gray-600 dark:text-gray-300">Total Products</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;