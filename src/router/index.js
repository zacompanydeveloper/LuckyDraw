import { app } from '@/app_root.js'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { isUserAuthenticated, isAdminAuthenticated } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userAuth = isUserAuthenticated()
  const adminAuth = isAdminAuthenticated()

  // Admin protected routes
  if (to.meta.requiresAdminAuth && !adminAuth) {
    return next({ name: 'admin-login' })
  }

  // User protected routes
  if (to.meta.requiresUserAuth && !userAuth) {
    return next({ name: 'user-login' })
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
