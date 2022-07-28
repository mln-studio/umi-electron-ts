const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    name: '首页',
    path: '/home',
    icon: 'home',
    component: './Home',
  },
  {
    name: '权限演示',
    path: '/access',
    icon: 'copy',
    component: './Access',
  },
  {
    name: ' CRUD 示例',
    path: '/table',
    icon: 'table',
    component: './Table',
  },
];

export default routes;
