'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Users, MapPin, CheckCircle2, Clock, LogOut, UserCheck, UserX, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  approved: boolean
  created_at: string
}

interface Pendencia {
  id: string
  site: string
  tipo: 'Energia' | 'Arcon'
  subtipo: string
  observacoes: string
  foto_url?: string
  status: 'pendente' | 'finalizada'
  created_at: string
  created_by: string
  finished_at?: string
  finished_by?: string
}

interface Site {
  id: string
  name: string
  latitude: number
  longitude: number
  observacoes?: string
  approved: boolean
  created_at: string
}

export default function AdminPanel() {
  const { user, userProfile, signOut } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // New site form
  const [newSiteName, setNewSiteName] = useState('')
  const [newSiteLatitude, setNewSiteLatitude] = useState('')
  const [newSiteLongitude, setNewSiteLongitude] = useState('')
  const [newSiteObservacoes, setNewSiteObservacoes] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Fetch pendencias
    const { data: pendenciasData } = await supabase
      .from('pendencias')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Fetch sites
    const { data: sitesData } = await supabase
      .from('sites_kml')
      .select('*')
      .order('name')
    
    setUsers(usersData || [])
    setPendencias(pendenciasData || [])
    setSites(sitesData || [])
    setLoading(false)
  }

  const approveUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ approved: true })
      .eq('id', userId)
    
    if (!error) {
      fetchData()
    }
  }

  const rejectUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ approved: false })
      .eq('id', userId)
    
    if (!error) {
      fetchData()
    }
  }

  const finalizePendencia = async (pendenciaId: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('pendencias')
      .update({ 
        status: 'finalizada',
        finished_at: new Date().toISOString(),
        finished_by: user.id
      })
      .eq('id', pendenciaId)
    
    if (!error) {
      fetchData()
    }
  }

  const approveSite = async (siteId: string) => {
    const { error } = await supabase
      .from('sites_kml')
      .update({ approved: true })
      .eq('id', siteId)
    
    if (!error) {
      fetchData()
    }
  }

  const rejectSite = async (siteId: string) => {
    const { error } = await supabase
      .from('sites_kml')
      .update({ approved: false })
      .eq('id', siteId)
    
    if (!error) {
      fetchData()
    }
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const { error } = await supabase
      .from('sites_kml')
      .insert({
        name: newSiteName,
        latitude: parseFloat(newSiteLatitude),
        longitude: parseFloat(newSiteLongitude),
        observacoes: newSiteObservacoes,
        approved: true
      })
    
    if (!error) {
      setNewSiteName('')
      setNewSiteLatitude('')
      setNewSiteLongitude('')
      setNewSiteObservacoes('')
      fetchData()
    }
    
    setSubmitting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {userProfile?.name}</p>
            </div>
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="pendencias">Pendências</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="add-site">Adicionar Site</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription>
                  Aprove ou rejeite usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.approved ? 'default' : 'destructive'}>
                            {user.approved ? 'Aprovado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          {user.role !== 'admin' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveUser(user.id)}
                                disabled={user.approved}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectUser(user.id)}
                                disabled={!user.approved}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pendencias">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Pendências</CardTitle>
                <CardDescription>
                  Visualize e finalize pendências do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendencias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma pendência encontrada
                    </div>
                  ) : (
                    pendencias.map((pendencia) => (
                      <div key={pendencia.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{pendencia.site}</span>
                              <Badge variant={pendencia.status === 'pendente' ? 'destructive' : 'default'}>
                                {pendencia.status === 'pendente' ? (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pendente
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Finalizada
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {pendencia.tipo} - {pendencia.subtipo}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500">
                              {formatDate(pendencia.created_at)}
                            </div>
                            {pendencia.status === 'pendente' && (
                              <Button
                                size="sm"
                                onClick={() => finalizePendencia(pendencia.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Finalizar
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <strong>Observações:</strong> {pendencia.observacoes}
                        </div>
                        
                        {pendencia.finished_at && (
                          <div className="text-sm text-green-600">
                            Finalizada em {formatDate(pendencia.finished_at)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Gerenciar Sites
                </CardTitle>
                <CardDescription>
                  Aprove ou rejeite sites KML
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>{site.latitude.toFixed(6)}</TableCell>
                        <TableCell>{site.longitude.toFixed(6)}</TableCell>
                        <TableCell>
                          <Badge variant={site.approved ? 'default' : 'destructive'}>
                            {site.approved ? 'Aprovado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(site.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveSite(site.id)}
                              disabled={site.approved}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectSite(site.id)}
                              disabled={!site.approved}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add-site">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Novo Site
                </CardTitle>
                <CardDescription>
                  Cadastre um novo site no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSite} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Site</Label>
                      <Input
                        id="name"
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                        placeholder="Ex: Site ABC-001"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={newSiteLatitude}
                        onChange={(e) => setNewSiteLatitude(e.target.value)}
                        placeholder="Ex: -23.550520"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={newSiteLongitude}
                        onChange={(e) => setNewSiteLongitude(e.target.value)}
                        placeholder="Ex: -46.633309"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Input
                        id="observacoes"
                        value={newSiteObservacoes}
                        onChange={(e) => setNewSiteObservacoes(e.target.value)}
                        placeholder="Observações opcionais"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando site...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Site
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}