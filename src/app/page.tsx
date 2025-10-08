'use client'

import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Shield, UserPlus } from 'lucide-react'
import Dashboard from '@/components/dashboard'
import AdminPanel from '@/components/admin-panel'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const { user, userProfile, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')
    
    const { error } = await signIn(email, password)
    
    if (error) {
      setError('Email ou senha incorretos')
    }
    
    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')
    setSuccess('')
    
    const { error } = await signUp(email, password, name)
    
    if (error) {
      setError('Erro ao criar conta: ' + error.message)
    } else {
      setSuccess('Conta criada com sucesso! Aguarde aprovação do administrador.')
      setEmail('')
      setPassword('')
      setName('')
    }
    
    setAuthLoading(false)
  }

  const createAdminUser = async () => {
    setAuthLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Create admin user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@sistema.com',
        password: 'admin123'
      })

      if (signUpError) {
        setError('Erro ao criar usuário admin: ' + signUpError.message)
        setAuthLoading(false)
        return
      }

      if (data.user) {
        // Create admin profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: 'admin@sistema.com',
            name: 'Administrador',
            role: 'admin',
            approved: true
          })

        if (profileError) {
          setError('Erro ao criar perfil admin: ' + profileError.message)
        } else {
          setSuccess('Usuário administrador criado com sucesso! Email: admin@sistema.com | Senha: admin123')
        }
      }
    } catch (err) {
      setError('Erro inesperado ao criar admin')
    }
    
    setAuthLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // User not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sistema de Pendências
            </CardTitle>
            <CardDescription>
              Faça login ou crie sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
                
                {/* Admin credentials info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Acesso Administrativo</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div><strong>Email:</strong> admin@sistema.com</div>
                    <div><strong>Senha:</strong> admin123</div>
                  </div>
                </div>
                
                {/* Create admin button */}
                <Button 
                  onClick={createAdminUser} 
                  variant="outline" 
                  className="w-full mt-3"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Usuário Admin
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mt-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // User not approved
  if (userProfile && !userProfile.approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-800">
              Aguardando Aprovação
            </CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso, mas ainda precisa ser aprovada pelo administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Você receberá acesso assim que um administrador aprovar sua conta.
              </p>
            </div>
            <Button onClick={signOut} variant="outline" className="w-full">
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin user
  if (userProfile?.role === 'admin') {
    return <AdminPanel />
  }

  // Regular user
  return <Dashboard />
}