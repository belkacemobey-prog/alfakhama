'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, Lock, Mail, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'
import AdminLanguageToggle from '@/components/admin/AdminLanguageToggle'

export default function AdminLoginPage() {
  const router = useRouter()
  const { t } = useAdminLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) {
      console.error('[admin login]', error.message)
      toast.error(t('login.error'))
      setLoading(false)
      return
    }
    toast.success(t('login.success'))
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
        <AdminLanguageToggle />
      </div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-secondary">{t('login.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 rtl:left-auto rtl:right-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@alfakhama.tn"
                required
                className="input-field pl-10 rtl:pl-4 rtl:pr-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 rtl:left-auto rtl:right-3" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pl-10 rtl:pl-4 rtl:pr-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-3"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('login.submitting')}
              </>
            ) : (
              t('login.submit')
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">{t('login.footer')}</p>
      </motion.div>
    </div>
  )
}
