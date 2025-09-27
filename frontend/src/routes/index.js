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
const QuotationsList = lazy(() => import('../pages/Quotations/QuotationsList'))
const ViewQuotations = lazy(() => import('../pages/Quotations/ViewQuotations'))
const EditQuotations = lazy(() => import('../pages/Quotations/EditQuotations'))
const CreateQuotations = lazy(() => import('../pages/Quotations/CreateQuotations'))
const CreateCateringQuotations = lazy(() => import('../pages/CateringQuotations/CreateCateringQuotations'))
const EditCateringQuotations = lazy(() => import('../pages/CateringQuotations/EditCateringQuotations'))
const ViewCateringQuotations = lazy(() => import('../pages/CateringQuotations/ViewCateringQuotations'))

const Blank = lazy(() => import('../pages/Blank'))

const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    name: '/dashboard'
  },
  {
    path: '/clients',
    component: Clients,
    name: '/clients'
  },
  {
    path: '/clients/create',
    component: CreateClients,
    name: '/clients'
  },
  {
    path: '/clients/edit/:id',
    component: EditClient,
    name: '/clients'
  },
  {
    path: '/products',
    component: Products,
    name: '/products'
  },
  {
    path: '/products/create',
    component: CreateProducts,
    name: '/products'
  },
  {
    path: '/projects/edit/:id',
    component: EditProjects,
    name: '/products'
  },
  {
    path: '/quotations',
    component: QuotationsList,
    name: '/quotations'
  },
  {
    path: '/sizes',
    component: Size,
    name: '/sizes'
  },
  {
    path: '/quotations/create',
    component: CreateQuotations,
    name: '/quotations'
  },
  {
    path: '/quotations/edit/:id',
    component: EditQuotations,
    name: '/quotations'
  },
  {
    path: '/quotations/view/:id',
    component: ViewQuotations,
    name: '/quotations'
  },
  {
    path: '/catering-quotations',
    component: QuotationsList,
    name: 'cateringQuotations'
  },
  {
    path: '/catering-quotations/create',
    component: CreateCateringQuotations,
    name: 'cateringQuotations'
  },
  {
    path: '/catering-quotations/edit/:id',
    component: EditCateringQuotations,
    name: 'cateringQuotations'
  },
  {
    path: '/catering-quotations/view/:id',
    component: ViewCateringQuotations,
    name: 'cateringQuotations'
  },
  {
    path: '/forms',
    component: Forms,
    name: null
  },
  {
    path: '/cards',
    component: Cards,
    name: null
  },
  {
    path: '/charts',
    component: Charts,
    name: null
  },
  {
    path: '/buttons',
    component: Buttons,
    name: null
  },
  {
    path: '/modals',
    component: Modals,
    name: null
  },
  {
    path: '/tables',
    component: Tables,
    name: null
  },
  {
    path: '/404',
    component: Page404,
    name: null
  },
  {
    path: '/blank',
    component: Blank,
    name: null
  },
  {
    path: '/configuration',
    component: Configuration,
    name: '/configuration'
  },
  {
    path: '/configuration/create',
    component: CreateConfiguration,
    name: '/configuration'
  }
]

export default routes