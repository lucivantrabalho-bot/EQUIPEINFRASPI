import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          approved?: boolean
          created_at?: string
        }
      }
      pendencias: {
        Row: {
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
        Insert: {
          id?: string
          site: string
          tipo: 'Energia' | 'Arcon'
          subtipo: string
          observacoes: string
          foto_url?: string
          status?: 'pendente' | 'finalizada'
          created_at?: string
          created_by: string
          finished_at?: string
          finished_by?: string
        }
        Update: {
          id?: string
          site?: string
          tipo?: 'Energia' | 'Arcon'
          subtipo?: string
          observacoes?: string
          foto_url?: string
          status?: 'pendente' | 'finalizada'
          created_at?: string
          created_by?: string
          finished_at?: string
          finished_by?: string
        }
      }
      sites_kml: {
        Row: {
          id: string
          name: string
          latitude: number
          longitude: number
          observacoes?: string
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          latitude: number
          longitude: number
          observacoes?: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          latitude?: number
          longitude?: number
          observacoes?: string
          approved?: boolean
          created_at?: string
        }
      }
    }
  }
}