'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, CheckCircle2, Clock, LogOut, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

export default function Dashboard() {
  const { user, userProfile, signOut } = useAuth()
  const [pendencias, setPendencias] = useState<Pendencia[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form states
  const [selectedSite, setSelectedSite] = useState('')
  const [tipo, setTipo] = useState<'Energia' | 'Arcon'>('Energia')
  const [subtipo, setSubtipo] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const energiaSubtipos = [
    'Falta de energia',
    'Problema no gerador',
    'Bateria descarregada',
    'Problema elétrico',
    'Outro'
  ]

  const arconSubtipos = [
    'Ar condicionado não liga',
    'Temperatura inadequada',
    'Vazamento',
    'Ruído excessivo',
    'Outro'
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch pendencias
    const { data: pendenciasData } = await supabase
      .from('pendencias')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Fetch sites
    const { data: sitesData } = await supabase
      .from('sites_kml')
      .select('*')
      .eq('approved', true)
      .order('name')
    
    setPendencias(pendenciasData || [])
    setSites(sitesData || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSubmitting(true)
    
    const { error } = await supabase
      .from('pendencias')
      .insert({
        site: selectedSite,
        tipo,
        subtipo,
        observacoes,
        created_by: user.id,
        status: 'pendente'
      })
    
    if (!error) {
      setSelectedSite('')
      setTipo('Energia')
      setSubtipo('')
      setObservacoes('')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
        <Tabs defaultValue="nova" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nova">Nova Pendência</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nova">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Nova Pendência
                </CardTitle>
                <CardDescription>
                  Registre uma nova pendência no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="site">Site</Label>
                      <Select value={selectedSite} onValueChange={setSelectedSite} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.name}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {site.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select value={tipo} onValueChange={(value: 'Energia' | 'Arcon') => setTipo(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Energia">Energia</SelectItem>
                          <SelectItem value="Arcon">Ar Condicionado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtipo">Subtipo</Label>
                    <Select value={subtipo} onValueChange={setSubtipo} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o subtipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tipo === 'Energia' ? energiaSubtipos : arconSubtipos).map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Descreva detalhes sobre a pendência..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando pendência...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Pendência
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pendências</CardTitle>
                <CardDescription>
                  Visualize todas as pendências registradas
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
                          <div className="text-sm text-gray-500">
                            {formatDate(pendencia.created_at)}
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
        </Tabs>
      </div>
    </div>
  )
}