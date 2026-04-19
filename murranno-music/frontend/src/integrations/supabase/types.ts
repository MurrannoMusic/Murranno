export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      agency_clients: {
        Row: {
          agency_id: string
          client_id: string
          commission_percentage: number | null
          contract_details: Json | null
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          client_id: string
          commission_percentage?: number | null
          contract_details?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          client_id?: string
          commission_percentage?: number | null
          contract_details?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          apple_music_id: string | null
          apple_music_url: string | null
          audiomack_url: string | null
          bio: string | null
          created_at: string
          deezer_url: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          profile_image: string | null
          soundcloud_url: string | null
          spotify_id: string | null
          spotify_url: string | null
          stage_name: string
          tidal_url: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_music_id?: string | null
          apple_music_url?: string | null
          audiomack_url?: string | null
          bio?: string | null
          created_at?: string
          deezer_url?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          profile_image?: string | null
          soundcloud_url?: string | null
          spotify_id?: string | null
          spotify_url?: string | null
          stage_name: string
          tidal_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_music_id?: string | null
          apple_music_url?: string | null
          audiomack_url?: string | null
          bio?: string | null
          created_at?: string
          deezer_url?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          profile_image?: string | null
          soundcloud_url?: string | null
          spotify_id?: string | null
          spotify_url?: string | null
          stage_name?: string
          tidal_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      bundle_services: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          service_id: string
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          service_id: string
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_services_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "promotion_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "promotion_services"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_metrics: {
        Row: {
          campaign_id: string
          clicks: number
          conversions: number
          created_at: string
          date: string
          engagement: number
          id: string
          impressions: number
          reach: number
          spend: number
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicks?: number
          conversions?: number
          created_at?: string
          date: string
          engagement?: number
          id?: string
          impressions?: number
          reach?: number
          spend?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicks?: number
          conversions?: number
          created_at?: string
          date?: string
          engagement?: number
          id?: string
          impressions?: number
          reach?: number
          spend?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_services: {
        Row: {
          campaign_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_services_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "promotion_services"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          admin_notes: string | null
          artist_id: string | null
          budget: number
          bundle_id: string | null
          campaign_assets: Json | null
          campaign_brief: string | null
          category: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          payment_amount: number | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          platform: string
          promotion_type: string | null
          rejection_reason: string | null
          release_id: string | null
          social_links: Json | null
          spent: number
          start_date: string
          status: string
          target_audience: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          artist_id?: string | null
          budget: number
          bundle_id?: string | null
          campaign_assets?: Json | null
          campaign_brief?: string | null
          category?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          payment_amount?: number | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform: string
          promotion_type?: string | null
          rejection_reason?: string | null
          release_id?: string | null
          social_links?: Json | null
          spent?: number
          start_date: string
          status?: string
          target_audience?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          artist_id?: string | null
          budget?: number
          bundle_id?: string | null
          campaign_assets?: Json | null
          campaign_brief?: string | null
          category?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          payment_amount?: number | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform?: string
          promotion_type?: string | null
          rejection_reason?: string | null
          release_id?: string | null
          social_links?: Json | null
          spent?: number
          start_date?: string
          status?: string
          target_audience?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "promotion_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          bundle_id: string | null
          created_at: string | null
          id: string
          quantity: number | null
          service_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number | null
          service_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number | null
          service_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "promotion_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "promotion_services"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          amount: number
          artist_id: string
          created_at: string
          currency: string
          id: string
          period_end: string
          period_start: string
          platform: string | null
          release_id: string | null
          source: string
          status: string
          track_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          artist_id: string
          created_at?: string
          currency?: string
          id?: string
          period_end: string
          period_start: string
          platform?: string | null
          release_id?: string | null
          source: string
          status?: string
          track_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string
          currency?: string
          id?: string
          period_end?: string
          period_start?: string
          platform?: string | null
          release_id?: string | null
          source?: string
          status?: string
          track_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      label_artists: {
        Row: {
          artist_id: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          id: string
          label_id: string
          notes: string | null
          payout_schedule: string | null
          revenue_share_percentage: number | null
          status: string
          total_paid_out: number | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          label_id: string
          notes?: string | null
          payout_schedule?: string | null
          revenue_share_percentage?: number | null
          status?: string
          total_paid_out?: number | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          label_id?: string
          notes?: string | null
          payout_schedule?: string | null
          revenue_share_percentage?: number | null
          status?: string
          total_paid_out?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "label_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          campaign_updates: boolean
          created_at: string
          earnings_alerts: boolean
          email_notifications: boolean
          id: string
          in_app_notifications: boolean
          marketing_emails: boolean
          push_notifications: boolean
          release_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_updates?: boolean
          created_at?: string
          earnings_alerts?: boolean
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          marketing_emails?: boolean
          push_notifications?: boolean
          release_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_updates?: boolean
          created_at?: string
          earnings_alerts?: boolean
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          marketing_emails?: boolean
          push_notifications?: boolean
          release_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_methods: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string | null
          currency: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          metadata: Json | null
          recipient_code: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string | null
          currency?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          recipient_code: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string | null
          currency?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          metadata?: Json | null
          recipient_code?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          auto_approve_uploads: boolean
          content_moderation_enabled: boolean
          created_at: string
          email_notifications_enabled: boolean
          id: string
          max_file_size_mb: number
          max_uploads_per_month: number
          minimum_payout_amount: number
          payment_processor: string
          payout_schedule: string
          platform_fee_percentage: number
          platform_name: string
          restricted_words: string[] | null
          sms_notifications_enabled: boolean
          support_email: string
          updated_at: string
        }
        Insert: {
          auto_approve_uploads?: boolean
          content_moderation_enabled?: boolean
          created_at?: string
          email_notifications_enabled?: boolean
          id?: string
          max_file_size_mb?: number
          max_uploads_per_month?: number
          minimum_payout_amount?: number
          payment_processor?: string
          payout_schedule?: string
          platform_fee_percentage?: number
          platform_name?: string
          restricted_words?: string[] | null
          sms_notifications_enabled?: boolean
          support_email?: string
          updated_at?: string
        }
        Update: {
          auto_approve_uploads?: boolean
          content_moderation_enabled?: boolean
          created_at?: string
          email_notifications_enabled?: boolean
          id?: string
          max_file_size_mb?: number
          max_uploads_per_month?: number
          minimum_payout_amount?: number
          payment_processor?: string
          payout_schedule?: string
          platform_fee_percentage?: number
          platform_name?: string
          restricted_words?: string[] | null
          sms_notifications_enabled?: boolean
          support_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          payout_lock_until: string | null
          transaction_pin_hash: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          payout_lock_until?: string | null
          transaction_pin_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          payout_lock_until?: string | null
          transaction_pin_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotion_bundles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          slug: string
          target_description: string | null
          tier_level: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          slug: string
          target_description?: string | null
          tier_level: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          target_description?: string | null
          tier_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      promotion_services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string | null
          features: Json | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
          videos: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          updated_at?: string
          videos?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
          videos?: string[] | null
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          is_active: boolean
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          artist_id: string
          copyright: string | null
          cover_art_url: string | null
          created_at: string
          genre: string | null
          id: string
          label: string | null
          language: string | null
          release_date: string
          release_type: string
          smartlink: string | null
          status: string
          title: string
          upc_ean: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          copyright?: string | null
          cover_art_url?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          label?: string | null
          language?: string | null
          release_date: string
          release_type: string
          smartlink?: string | null
          status?: string
          title: string
          upc_ean?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          copyright?: string | null
          cover_art_url?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          label?: string | null
          language?: string | null
          release_date?: string
          release_type?: string
          smartlink?: string | null
          status?: string
          title?: string
          upc_ean?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      streaming_data: {
        Row: {
          country: string | null
          created_at: string
          date: string
          id: string
          platform: string
          streams: number
          track_id: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          date: string
          id?: string
          platform: string
          streams?: number
          track_id: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          date?: string
          id?: string
          platform?: string
          streams?: number
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaming_data_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          features: Json | null
          id: string
          max_artists: number | null
          name: string
          price_monthly: number
          tier: Database["public"]["Enums"]["user_tier"]
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          max_artists?: number | null
          name: string
          price_monthly: number
          tier: Database["public"]["Enums"]["user_tier"]
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          max_artists?: number | null
          name?: string
          price_monthly?: number
          tier?: Database["public"]["Enums"]["user_tier"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          manually_managed: boolean | null
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          refunded_at: string | null
          status: string
          tier: Database["public"]["Enums"]["user_tier"]
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          manually_managed?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          refunded_at?: string | null
          status?: string
          tier: Database["public"]["Enums"]["user_tier"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          manually_managed?: boolean | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          refunded_at?: string | null
          status?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          audio_file_url: string | null
          created_at: string
          duration: number
          id: string
          isrc: string | null
          lyrics: string | null
          release_id: string
          title: string
          track_number: number
          updated_at: string
        }
        Insert: {
          audio_file_url?: string | null
          created_at?: string
          duration: number
          id?: string
          isrc?: string | null
          lyrics?: string | null
          release_id: string
          title: string
          track_number: number
          updated_at?: string
        }
        Update: {
          audio_file_url?: string | null
          created_at?: string
          duration?: number
          id?: string
          isrc?: string | null
          lyrics?: string | null
          release_id?: string
          title?: string
          track_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          tier: Database["public"]["Enums"]["user_tier"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_balance: {
        Row: {
          available_balance: number | null
          created_at: string | null
          currency: string
          id: string
          pending_balance: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          pending_balance?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          pending_balance?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      withdrawal_transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string
          description: string | null
          failure_reason: string | null
          fee: number | null
          id: string
          net_amount: number
          payout_method_id: string | null
          paystack_response: Json | null
          reference: string
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transfer_code: string | null
          updated_at: string | null
          user_id: string | null
          scheduled_for: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          failure_reason?: string | null
          fee?: number | null
          id?: string
          net_amount: number
          payout_method_id?: string | null
          paystack_response?: Json | null
          reference: string
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transfer_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          scheduled_for?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          failure_reason?: string | null
          fee?: number | null
          id?: string
          net_amount?: number
          payout_method_id?: string | null
          paystack_response?: Json | null
          reference?: string
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transfer_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          scheduled_for?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_transactions_payout_method_id_fkey"
            columns: ["payout_method_id"]
            isOneToOne: false
            referencedRelation: "payout_methods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_active_tiers: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      get_user_tier: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_tier"]
      }
      has_admin_role: { Args: { _user_id: string }; Returns: boolean }
      refund_withdrawal_to_wallet: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      payment_status: "pending" | "paid" | "failed" | "refunded"
      user_tier: "artist" | "label" | "agency" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      payment_status: ["pending", "paid", "failed", "refunded"],
      user_tier: ["artist", "label", "agency", "admin"],
    },
  },
} as const
