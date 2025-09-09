import { lazy } from 'react'

// const Dashboard = lazy(() => import('../pages/Dashboard'))
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
  },
  {
    path: '/clients',
    component: Clients,
  },
  {
    path: '/clients/create',
    component: CreateClients,
  },
  {
    path: '/clients/edit/:id',
    component: EditClient
  },

  {
    path: '/products',
    component: Products,
  },
  {
    path: '/products/create',
    component: CreateProducts,
  },
  {
    path: '/projects/edit/:id',
    component: EditProjects
  },
  {
    path: '/quotations',
    component: Quotations,
  },
  {
    path: '/sizes',
    component: Size,
  },
  {
    path: '/quotations/create',
    component: CreateQuotations,
  },
  {
    path: '/quotations/edit/:id',
    component: EditQuotations
  },

  {
    path: '/quotations/view/:id',
    component: ViewQuotations,
  },
  {
    path: '/forms',
    component: Forms,
  },
  {
    path: '/cards',
    component: Cards,
  },
  {
    path: '/charts',
    component: Charts,
  },
  {
    path: '/buttons',
    component: Buttons,
  },
  {
    path: '/modals',
    component: Modals,
  },
  {
    path: '/tables',
    component: Tables,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },
  {
    path: '/configuration',
    component: Configuration,
  },
  {
    path: '/configuration/create',
    component: CreateConfiguration,
  }
]

export default routes