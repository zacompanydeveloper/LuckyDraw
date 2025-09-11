import { app } from '@/app_root.js'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { isUserAuthenticated, isAdminAuthenticated } from '@/utils/auth'

function getUserPermissions() {
  return JSON.parse(localStorage.getItem('userPermissions') || '[]')
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userAuth = isUserAuthenticated()
  const adminAuth = isAdminAuthenticated()
  const userPermissions = getUserPermissions()

  if (to.path === '/') {
    return next({ name: 'admin-login' })
  }

  // Admin protected routes
  if (to.meta.requiresAdminAuth && !adminAuth) {
    return next({ name: 'admin-login' })
  }

  // User protected routes
  if (to.meta.requiresUserAuth && !userAuth) {
    return next({ name: 'user-login' })
  }

  // Permission check
  if (to.meta.permissions && to.meta.permissions.length > 0) {
    const hasPermission = to.meta.permissions.every((perm) =>
      userPermissions.includes(perm)
    )

    console.log("Checking permissions for route:", to.name, "Required:", to.meta.permissions, "User has:", userPermissions, "Result:", hasPermission);
    

    if (!hasPermission) {
      // Option 1: redirect to a 403 page
      return next({ name: 'forbidden' })
      // Option 2: just block navigation silently
      // return false
    }
  }

  // Prevent logged-in users from visiting login pages
  if (to.meta.guest) {
    if (to.meta.role === 'admin' && adminAuth) {
      return next({ name: 'admin-panel' })
    }
    if (to.meta.role === 'user' && userAuth) {
      return next({ name: 'user-dashboard' })
    }
  }

  next()
})

app.use(router)

export default router
