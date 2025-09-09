/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
*
* If you're looking to actual Router routes, go to
* `routes/index.js`
*/
const routes = [
   
  {
    path: '/app/dashboard',
    icon: 'PeopleIcon',
    name: 'Dashboard',
  },
  {
    path: '/app/quotations',
    icon: 'FormsIcon',
    name: 'Quotations',
  },
  {
    path: '/app/clients', // the url
    icon: 'HomeIcon', // the component being exported from icons/index.js
    name: 'Clients', // name that appear in Sidebar
  },
  {
    path: '/app/products',
    icon: 'ChartsIcon',
    name: 'Products',
  },
  {
    path: '/app/sizes',
    icon: 'ButtonsIcon',
    name: 'Sizes',
  },

 {
    path: '/app/configuration',
    icon: 'MenuIcon',
    name: 'Configuration',
    
  },
 


]

export default routes
