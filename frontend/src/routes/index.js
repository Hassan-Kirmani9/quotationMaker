import { lazy } from 'react'

const Forms = lazy(() => import('../pages/Forms'))
const Cards = lazy(() => import('../pages/Cards'))
const Charts = lazy(() => import('../pages/Charts'))
const Buttons = lazy(() => import('../pages/Buttons'))
const Modals = lazy(() => import('../pages/Modals'))
const Tables = lazy(() => import('../pages/Tables'))
const Page404 = lazy(() => import('../pages/404'))
const Clients = lazy(() => import('../pages/Clients/Clients'))
const Dashboard = lazy(() => import('../pages/Dashboard/dashboard'))

const CreateClients = lazy(() => import('../pages/Clients/CreateClients'))
const EditClient = lazy(() => import('../pages/Clients/EditClient'))

const Configuration = lazy(() => import('../pages/Configurations/Configurations'))
const CreateConfiguration = lazy(() => import('../pages/Configurations/CreateConfigurations'))

const Products = lazy(() => import('../pages/Products/Products'))
const Size = lazy(() => import('../pages/Size/Size'))
const EditProjects = lazy(() => import('../pages/Projects/EditProject'))

const CreateProducts = lazy(() => import('../pages/Products/CreateProducts'))
const Quotations = lazy(() => import('../pages/Quotations/Quotations'))
const CreateQuotations = lazy(() => import('../pages/Quotations/CreateQuotations'))
const ViewQuotations = lazy(() => import('../pages/Quotations/ViewQuotations'))
const EditQuotations = lazy(() => import('../pages/Quotations/EditQuotations'))

const Blank = lazy(() => import('../pages/Blank'))

const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    requiredPage: '/dashboard'
  },
  {
    path: '/clients',
    component: Clients,
    requiredPage: '/clients'
  },
  {
    path: '/clients/create',
    component: CreateClients,
    requiredPage: '/clients'
  },
  {
    path: '/clients/edit/:id',
    component: EditClient,
    requiredPage: '/clients'
  },
  {
    path: '/products',
    component: Products,
    requiredPage: '/products'
  },
  {
    path: '/products/create',
    component: CreateProducts,
    requiredPage: '/products'
  },
  {
    path: '/projects/edit/:id',
    component: EditProjects,
    requiredPage: '/products'
  },
  {
    path: '/quotations',
    component: Quotations,
    requiredPage: '/quotations'
  },
  {
    path: '/sizes',
    component: Size,
    requiredPage: '/sizes'
  },
  {
    path: '/quotations/create',
    component: CreateQuotations,
    requiredPage: '/quotations'
  },
  {
    path: '/quotations/edit/:id',
    component: EditQuotations,
    requiredPage: '/quotations'
  },
  {
    path: '/quotations/view/:id',
    component: ViewQuotations,
    requiredPage: '/quotations'
  },
  {
    path: '/forms',
    component: Forms,
    requiredPage: null
  },
  {
    path: '/cards',
    component: Cards,
    requiredPage: null
  },
  {
    path: '/charts',
    component: Charts,
    requiredPage: null
  },
  {
    path: '/buttons',
    component: Buttons,
    requiredPage: null
  },
  {
    path: '/modals',
    component: Modals,
    requiredPage: null
  },
  {
    path: '/tables',
    component: Tables,
    requiredPage: null
  },
  {
    path: '/404',
    component: Page404,
    requiredPage: null
  },
  {
    path: '/blank',
    component: Blank,
    requiredPage: null
  },
  {
    path: '/configuration',
    component: Configuration,
    requiredPage: '/configuration'
  },
  {
    path: '/configuration/create',
    component: CreateConfiguration,
    requiredPage: '/configuration'
  }
]

export default routes