import { logDebug, isRenderDebugEnabled } from './debug';
import { normalizeSocialUrl, getIconForPlatform, FOOTER_DEFAULTS } from './socialUtils';

/**
 * [SIP v10.6] Hydration Bridge Registry
 * Centraliza la compatibilidad entre el contrato de contenido plano (SIP) y las llaves profundas del constructor.
 * 
 * REGLAS TÉCNICAS:
 * 1. content_draft es la fuente del editor; Canvas usa settingsValues (llaves profundas).
 * 2. content_published usa section.content + section.settings planos.
 * 3. Este bridge mapea content plano hacia deep keys para el Viewer.
 * 4. PRIORIDAD: Si una deep key ya existe en existingDeepValues, se PRESERVA. No se sobrescribe.
 * 5. VALIDACIÓN: No usar if(value); usar null/undefined check explícito (0, "", false son válidos).
 * 6. REPEATERS: Mapear hacia las llaves reales del registry para asegurar persistencia.
 */

/**
 * Utility to get values from nested objects using dot notation (e.g. 'primary_cta.text')
 */
function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

interface ModuleBridgeAdapter {
  contentToSettings?: Record<string, string>;
  settingsToDeep?: Record<string, string>;
}

/**
 * Registro de adaptadores certificados por módulo.
 */
const MODULE_ADAPTERS: Record<string, ModuleBridgeAdapter> = {
  hero: {
    contentToSettings: {
      'title': 'el_hero_typography_title',
      'subtitle': 'el_hero_typography_subtitle',
      'eyebrow': 'el_hero_typography_eyebrow',
      'image_url': 'el_hero_media_image',
      'primary_cta.text': 'el_hero_ctas_primary_text',
      'primary_cta.url': 'el_hero_ctas_primary_url',
      'secondary_cta.text': 'el_hero_ctas_secondary_text',
      'secondary_cta.url': 'el_hero_ctas_secondary_url',
      'title_mode': 'el_hero_typography_title_mode',
      // Dynamic Text Compatibility (Legacy Spanish keys)
      'is_rotating_active': 'el_hero_typography_rotating_enabled',
      'texto_base': 'el_hero_typography_rotating_fixed',
      'palabras_efecto': 'el_hero_typography_rotating_options',
      'intervalo_ms': 'el_hero_typography_rotating_speed',
      // Dynamic Text Compatibility (New English keys from content.config)
      'config.texto_base': 'el_hero_typography_rotating_fixed',
      'config.palabras_efecto': 'el_hero_typography_rotating_options',
      'config.intervalo_ms': 'el_hero_typography_rotating_speed',
      'config.estilo_efecto': 'el_hero_typography_rotating_color'
    }
  },
  features: {
    contentToSettings: {
      'title': 'el_features_header_title',
      'subtitle': 'el_features_header_subtitle',
      'eyebrow': 'el_features_header_eyebrow'
    },
    settingsToDeep: {
      'columns': 'global_columns',
      'gap': 'global_gap',
      'layout': 'global_layout',
      'items': 'el_feature_card_items'
    }
  },
  pricing: {
    contentToSettings: {
      'title': 'el_pricing_header_title',
      'subtitle': 'el_pricing_header_subtitle',
      'eyebrow': 'el_pricing_header_eyebrow',
      'plans': 'el_pricing_plans_plans'
    },
    settingsToDeep: {
      'columns': 'global_columns',
      'gap': 'global_gap',
      'layout': 'global_layout',
      'plans': 'el_pricing_plans_plans'
    }
  },
  menu: {
    contentToSettings: {
      'logo_text': 'el_menu_logo_logo_text',
      'logo_url': 'el_menu_logo_logo_img',
      'image_url': 'el_menu_logo_logo_img',
      'links': 'el_menu_items_links',
      'items': 'el_menu_items_links'
    },
    settingsToDeep: {
      'sticky': 'global_sticky',
      'position': 'global_position'
    }
  },
  navegacion: {
    contentToSettings: {
      'logo_text': 'el_menu_logo_logo_text',
      'logo_url': 'el_menu_logo_logo_img',
      'image_url': 'el_menu_logo_logo_img',
      'links': 'el_menu_items_links',
      'items': 'el_menu_items_links'
    },
    settingsToDeep: {
      'sticky': 'global_sticky',
      'position': 'global_position'
    }
  },
  about: {
    contentToSettings: {
      // Eyebrow
      'eyebrow': 'el_about_narrative_eyebrow',
      'label': 'el_about_narrative_eyebrow',
      'kicker': 'el_about_narrative_eyebrow',
      
      // Title
      'title': 'el_about_narrative_title',
      'titulo': 'el_about_narrative_title',
      'heading': 'el_about_narrative_title',
      'headline': 'el_about_narrative_title',
      
      // Description
      'description': 'el_about_narrative_description',
      'descripcion': 'el_about_narrative_description',
      'subtitle': 'el_about_narrative_description',
      'subtitulo': 'el_about_narrative_description',
      'summary': 'el_about_narrative_description',
      'resumen': 'el_about_narrative_description',
      'story': 'el_about_narrative_description',
      'historia': 'el_about_narrative_description',
      
      // Quote
      'quote': 'el_about_narrative_quote',
      'cita': 'el_about_narrative_quote',
      'tagline': 'el_about_narrative_quote',
      'frase': 'el_about_narrative_quote',

      // Image
      'image_url': 'el_about_visual_image_url',
      'image.url': 'el_about_visual_image_url',
      'media.url': 'el_about_visual_image_url',
      'image': 'el_about_visual_image_url',
      'img': 'el_about_visual_image_url',
      'featured_image': 'el_about_visual_image_url',
      
      'image_alt': 'el_about_visual_image_alt',
      'image.alt': 'el_about_visual_image_alt',
      'media.alt': 'el_about_visual_image_alt',
      'alt': 'el_about_visual_image_alt',

      // CTA
      'button_text': 'el_about_narrative_button_text',
      'cta_text': 'el_about_narrative_button_text',
      'cta.label': 'el_about_narrative_button_text',
      'cta.text': 'el_about_narrative_button_text',
      'cta.title': 'el_about_narrative_button_text',
      'button_url': 'el_about_narrative_button_url',
      'cta_url': 'el_about_narrative_button_url',
      'cta.url': 'el_about_narrative_button_url',
      'cta.href': 'el_about_narrative_button_url',
      'cta.link': 'el_about_narrative_button_url'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'image_position': 'global_layout', // En about el layout controla la posición
      'background_style': 'global_bg_color'
    }
  },
  process: {
    contentToSettings: {
      'eyebrow': 'el_process_header_eyebrow',
      'kicker': 'el_process_header_eyebrow',
      'label': 'el_process_header_eyebrow',
      'tagline': 'el_process_header_eyebrow',
      'etiqueta': 'el_process_header_eyebrow',
      
      'title': 'el_process_header_title',
      'titulo': 'el_process_header_title',
      'heading': 'el_process_header_title',
      'headline': 'el_process_header_title',
      'nombre': 'el_process_header_title',

      'subtitle': 'el_process_header_subtitle',
      'subtitulo': 'el_process_header_subtitle',
      'description': 'el_process_header_subtitle',
      'descripcion': 'el_process_header_subtitle',
      'summary': 'el_process_header_subtitle',
      'resumen': 'el_process_header_subtitle',
      'intro': 'el_process_header_subtitle',
      'texto': 'el_process_header_subtitle'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns'
    }
  },
  footer: {
    contentToSettings: {
      'bio': 'el_footer_brand_bio',
      'description': 'el_footer_brand_bio',
      'descripcion': 'el_footer_brand_bio',
      'brand.bio': 'el_footer_brand_bio',
      'brand.description': 'el_footer_brand_bio',
      'brand.descripcion': 'el_footer_brand_bio',
      'marca.descripcion': 'el_footer_brand_bio',
      
      'logo': 'el_footer_brand_logo_img',
      'logo_img': 'el_footer_brand_logo_img',
      'logo_url': 'el_footer_brand_logo_img',
      'brand.logo': 'el_footer_brand_logo_img',
      'brand.logo_url': 'el_footer_brand_logo_img',
      'brand.image': 'el_footer_brand_logo_img',
      'marca.logo': 'el_footer_brand_logo_img',
      
      'logo_width': 'el_footer_brand_logo_width',
      'brand.logo_width': 'el_footer_brand_logo_width',
      'marca.logo_width': 'el_footer_brand_logo_width',
      
      'show_logo': 'el_footer_brand_show_logo',
      'brand.show_logo': 'el_footer_brand_show_logo',
      'marca.show_logo': 'el_footer_brand_show_logo',

      'address': 'el_footer_contact_address',
      'direccion': 'el_footer_contact_address',
      'contact.address': 'el_footer_contact_address',
      'contact.direccion': 'el_footer_contact_address',
      'contacto.address': 'el_footer_contact_address',
      'contacto.direccion': 'el_footer_contact_address',

      'phone': 'el_footer_contact_phone',
      'telefono': 'el_footer_contact_phone',
      'tel': 'el_footer_contact_phone',
      'contact.phone': 'el_footer_contact_phone',
      'contact.telefono': 'el_footer_contact_phone',
      'contacto.phone': 'el_footer_contact_phone',
      'contacto.telefono': 'el_footer_contact_phone',

      'email': 'el_footer_contact_email',
      'correo': 'el_footer_contact_email',
      'contact.email': 'el_footer_contact_email',
      'contact.correo': 'el_footer_contact_email',
      'contacto.email': 'el_footer_contact_email',
      'contacto.correo': 'el_footer_contact_email',

      'show_contact': 'el_footer_contact_show_contact',
      'contact.show_contact': 'el_footer_contact_show_contact',
      'contacto.show_contact': 'el_footer_contact_show_contact',

      'news_title': 'el_footer_newsletter_news_title',
      'newsletter_title': 'el_footer_newsletter_news_title',
      'newsletter.title': 'el_footer_newsletter_news_title',
      'newsletter.titulo': 'el_footer_newsletter_news_title',

      'news_desc': 'el_footer_newsletter_news_desc',
      'newsletter_description': 'el_footer_newsletter_news_desc',
      'newsletter.description': 'el_footer_newsletter_news_desc',
      'newsletter.descripcion': 'el_footer_newsletter_news_desc',

      'placeholder': 'el_footer_newsletter_placeholder',
      'newsletter.placeholder': 'el_footer_newsletter_placeholder',

      'btn_text': 'el_footer_newsletter_btn_text',
      'button_text': 'el_footer_newsletter_btn_text',
      'newsletter.btn_text': 'el_footer_newsletter_btn_text',
      'newsletter.button_text': 'el_footer_newsletter_btn_text',
      'newsletter.boton': 'el_footer_newsletter_btn_text',
      'newsletter.boton_texto': 'el_footer_newsletter_btn_text',

      'show_newsletter': 'el_footer_newsletter_show_newsletter',
      'newsletter.show': 'el_footer_newsletter_show_newsletter',
      'newsletter.show_newsletter': 'el_footer_newsletter_show_newsletter',

      'copyright': 'el_footer_bottom_copyright',
      'copy': 'el_footer_bottom_copyright',
      'legal.copyright': 'el_footer_bottom_copyright',
      'bottom.copyright': 'el_footer_bottom_copyright'
    },
    settingsToDeep: {
      'variant': 'global_variant',
      'layout': 'global_layout',
      'background': 'global_background'
    }
  },
  bento: {
    contentToSettings: {
      'eyebrow': 'el_bento_header_eyebrow',
      'kicker': 'el_bento_header_eyebrow',
      'label': 'el_bento_header_eyebrow',
      'etiqueta': 'el_bento_header_eyebrow',
      
      'title': 'el_bento_header_title',
      'titulo': 'el_bento_header_title',
      'heading': 'el_bento_header_title',
      'headline': 'el_bento_header_title',
      'nombre': 'el_bento_header_title',

      'subtitle': 'el_bento_header_subtitle',
      'subtitulo': 'el_bento_header_subtitle',
      'description': 'el_bento_header_subtitle',
      'descripcion': 'el_bento_header_subtitle',
      'summary': 'el_bento_header_subtitle',
      'resumen': 'el_bento_header_subtitle',
      'intro': 'el_bento_header_subtitle',
      'texto': 'el_bento_header_subtitle'
    },
    settingsToDeep: {
      'columns': 'global_columns',
      'gap': 'global_gap',
      'bg_color': 'global_bg_color',
      'dark_mode': 'global_dark_mode'
    }
  },
  products: {
    contentToSettings: {
      'title': 'el_products_header_title',
      'titulo': 'el_products_header_title',
      'heading': 'el_products_header_title',
      'eyebrow': 'el_products_header_eyebrow',
      'subtitle': 'el_products_header_subtitle',
      'subtitulo': 'el_products_header_subtitle',
      'description': 'el_products_header_subtitle',
      'descripcion': 'el_products_header_subtitle',
      'align': 'el_products_header_align',
      'selection_mode': 'el_products_config_selection_mode',
      'select_products': 'el_products_config_select_products',
      'currency': 'el_price_currency',
      'cta_text': 'el_cta_cta_text',
      'button_text': 'el_cta_cta_text'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns',
      'gap': 'global_gap',
      'dark_mode': 'global_dark_mode'
    }
  },
  products_showcase: {
    contentToSettings: {
      // Header Titles
      'header_title': 'global_header_title',
      'title': 'global_header_title',
      'titulo': 'global_header_title',
      'heading': 'global_header_title',
      'headline': 'global_header_title',
      'titulo_seccion': 'global_header_title',
      'nombre': 'global_header_title',

      // Header Subtitles
      'header_subtitle': 'global_header_subtitle',
      'subtitle': 'global_header_subtitle',
      'subtitulo': 'global_header_subtitle',
      'description': 'global_header_subtitle',
      'descripcion': 'global_header_subtitle',
      'summary': 'global_header_subtitle',
      'resumen': 'global_header_subtitle',
      'intro': 'global_header_subtitle',
      'texto': 'global_header_subtitle',

      // CTA Labels
      'cta_label': 'global_cta_label',
      'cta_text': 'global_cta_label',
      'button_text': 'global_cta_label',
      'boton_texto': 'global_cta_label',
      
      // Selection
      'select_products': 'el_products_showcase_config_select_products',
      'selected_products': 'el_products_showcase_config_select_products',
      'selectedProducts': 'el_products_showcase_config_select_products',
      'product_ids': 'el_products_showcase_config_select_products',
      'ids': 'el_products_showcase_config_select_products'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'variant': 'global_layout',
      'display': 'global_layout',
      
      'columns': 'global_columns',
      'columnas': 'global_columns',
      
      'show_tabs': 'global_show_tabs',
      'showTabs': 'global_show_tabs',
      'mostrar_tabs': 'global_show_tabs',
      
      'card_style': 'global_card_style',
      'cardStyle': 'global_card_style',
      'estilo_tarjeta': 'global_card_style',
      'variant_card': 'global_card_style'
    }
  },
  faq: {
    contentToSettings: {
      'title': 'el_faq_header_title',
      'titulo': 'el_faq_header_title',
      'heading': 'el_faq_header_title',
      'headline': 'el_faq_header_title',
      'subtitle': 'el_faq_header_subtitle',
      'subtitulo': 'el_faq_header_subtitle',
      'description': 'el_faq_header_subtitle',
      'descripcion': 'el_faq_header_subtitle',
      'eyebrow': 'el_faq_header_eyebrow'
    },
    settingsToDeep: {
      'layout': 'global_layout'
    }
  },
  testimonials: {
    contentToSettings: {
      'title': 'el_testimonials_header_title',
      'titulo': 'el_testimonials_header_title',
      'heading': 'el_testimonials_header_title',
      'headline': 'el_testimonials_header_title',
      'subtitle': 'el_testimonials_header_subtitle',
      'subtitulo': 'el_testimonials_header_subtitle',
      'description': 'el_testimonials_header_subtitle',
      'descripcion': 'el_testimonials_header_subtitle',
      'eyebrow': 'el_testimonials_header_eyebrow'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns'
    }
  },
  stats: {
    contentToSettings: {
      'title': 'el_stats_header_title',
      'titulo': 'el_stats_header_title',
      'heading': 'el_stats_header_title',
      'headline': 'el_stats_header_title',
      'subtitle': 'el_stats_header_subtitle',
      'subtitulo': 'el_stats_header_subtitle',
      'description': 'el_stats_header_subtitle',
      'descripcion': 'el_stats_header_subtitle',
      'eyebrow': 'el_stats_header_eyebrow'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns'
    }
  },
  clients: {
    contentToSettings: {
      'title': 'el_clients_header_title',
      'titulo': 'el_clients_header_title',
      'heading': 'el_clients_header_title',
      'headline': 'el_clients_header_title',
      'subtitle': 'el_clients_header_subtitle',
      'subtitulo': 'el_clients_header_subtitle',
      'description': 'el_clients_header_subtitle',
      'descripcion': 'el_clients_header_subtitle',
      'eyebrow': 'el_clients_header_eyebrow',
      'select_customers': 'el_client_logos_data_select_customers'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns',
      'gap': 'global_gap'
    }
  },
  team: {
    contentToSettings: {
      'title': 'el_team_header_title',
      'titulo': 'el_team_header_title',
      'heading': 'el_team_header_title',
      'headline': 'el_team_header_title',
      'subtitle': 'el_team_header_subtitle',
      'subtitulo': 'el_team_header_subtitle',
      'description': 'el_team_header_subtitle',
      'descripcion': 'el_team_header_subtitle',
      'eyebrow': 'el_team_header_eyebrow'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns',
      'gap': 'global_gap',
      'members': 'el_team_items_members'
    }
  },
  cta: {
    contentToSettings: {
      'title': 'el_cta_content_title',
      'titulo': 'el_cta_content_title',
      'heading': 'el_cta_content_title',
      'headline': 'el_cta_content_title',
      'subtitle': 'el_cta_content_subtitle',
      'subtitulo': 'el_cta_content_subtitle',
      'description': 'el_cta_content_subtitle',
      'descripcion': 'el_cta_content_subtitle',
      'text': 'el_cta_content_subtitle',
      'texto': 'el_cta_content_subtitle',
      'primary_text': 'el_cta_actions_primary_text',
      'btn_text': 'el_cta_actions_primary_text',
      'cta_text': 'el_cta_actions_primary_text',
      'boton_texto': 'el_cta_actions_primary_text',
      'primary_url': 'el_cta_actions_primary_url',
      'btn_url': 'el_cta_actions_primary_url',
      'cta_url': 'el_cta_actions_primary_url',
      'secondary_text': 'el_cta_actions_secondary_text',
      'secondary_url': 'el_cta_actions_secondary_url',
      'placeholder': 'el_cta_actions_placeholder',
      'trust_text': 'el_cta_trust_trust_text'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'max_width': 'global_max_width',
      'padding_y': 'global_padding_y'
    }
  },
  newsletter: {
    contentToSettings: {
      'title': 'el_news_header_title',
      'titulo': 'el_news_header_title',
      'heading': 'el_news_header_title',
      'headline': 'el_news_header_title',
      'subtitle': 'el_news_header_subtitle',
      'subtitulo': 'el_news_header_subtitle',
      'description': 'el_news_header_subtitle',
      'descripcion': 'el_news_header_subtitle',
      'placeholder': 'el_news_form_placeholder',
      'email_placeholder': 'el_news_form_placeholder',
      'button_text': 'el_news_form_button_text',
      'boton_texto': 'el_news_form_button_text',
      'submit_text': 'el_news_form_button_text',
      'cta_text': 'el_news_form_button_text',
      'success_message': 'el_news_form_success_message',
      'gdpr_text': 'el_news_form_gdpr_text'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'dark_mode': 'global_dark_mode'
    }
  },
  contact: {
    contentToSettings: {
      'title': 'el_contact_header_title',
      'titulo': 'el_contact_header_title',
      'heading': 'el_contact_header_title',
      'headline': 'el_contact_header_title',
      'subtitle': 'el_contact_header_subtitle',
      'subtitulo': 'el_contact_header_subtitle',
      'description': 'el_contact_header_subtitle',
      'descripcion': 'el_contact_header_subtitle',
      'email': 'el_contact_info_email',
      'correo': 'el_contact_info_email',
      'phone': 'el_contact_info_phone',
      'telefono': 'el_contact_info_phone',
      'whatsapp': 'el_contact_info_phone',
      'address': 'el_contact_info_address',
      'direccion': 'el_contact_info_address',
      'ubicacion': 'el_contact_info_address',
      'horario': 'el_contact_info_availability_text',
      'hours': 'el_contact_info_availability_text'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'dark_mode': 'global_dark_mode'
    }
  },
  spacer: {
    contentToSettings: {
      'height': 'global_height_desktop',
      'altura': 'global_height_desktop',
      'size': 'global_height_desktop',
      'height_mobile': 'global_height_mobile',
      'padding_y': 'global_padding_y',
      'width': 'global_width',
      'color': 'global_color',
      'background': 'global_bg_color',
      'bg_color': 'global_bg_color',
      'text': 'global_text',
      'icon': 'global_icon'
    },
    settingsToDeep: {
      'align': 'global_align',
      'type': 'global_type'
    }
  },
  gallery: {
    contentToSettings: {
      'title': 'el_gallery_header_title',
      'titulo': 'el_gallery_header_title',
      'heading': 'el_gallery_header_title',
      'headline': 'el_gallery_header_title',
      'subtitle': 'el_gallery_header_subtitle',
      'subtitulo': 'el_gallery_header_subtitle',
      'description': 'el_gallery_header_subtitle',
      'descripcion': 'el_gallery_header_subtitle',
      'eyebrow': 'el_gallery_header_eyebrow'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'columns': 'global_columns',
      'gap': 'global_gap'
    }
  },
  video: {
    contentToSettings: {
      'title': 'el_video_text_title',
      'titulo': 'el_video_text_title',
      'heading': 'el_video_text_title',
      'headline': 'el_video_text_title',
      'subtitle': 'el_video_text_subtitle',
      'subtitulo': 'el_video_text_subtitle',
      'description': 'el_video_text_subtitle',
      'descripcion': 'el_video_text_subtitle',
      'text': 'el_video_text_subtitle',
      'texto': 'el_video_text_subtitle',
      'eyebrow': 'el_video_text_eyebrow',
      'video_url': 'el_video_player_video_url',
      'poster_url': 'el_video_player_poster_url',
      'thumbnail': 'el_video_player_poster_url',
      'image': 'el_video_player_poster_url',
      'autoplay': 'el_video_player_autoplay',
      'controls': 'el_video_player_controls'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'aspect_ratio': 'global_aspect_ratio'
    }
  }
};

interface BridgeParams {
  type: string;
  moduleId: string;
  content: any;
  settings: any;
  existingDeepValues: Record<string, any>;
}

/**
 * Fallback genérico para hidratación.
 * Si una key existe en content (ej. "title"), genera una key prefijada (ej. "mod_123_title")
 * solo si no existe ya en el resultado.
 */
function applyGenericFallback(moduleId: string, data: any, result: Record<string, any>, prefix: string = '') {
  if (!data || typeof data !== 'object') return;

  Object.entries(data).forEach(([key, value]) => {
    // Evitar hidratar objetos complejos de configuración a bajo nivel (config, style, etc)
    // a menos que sean de primer nivel y simples.
    if (key === 'config' || key === 'styles' || key === 'settings') return;

    const fullKey = `${moduleId}_${prefix}${key}`;
    const hasValue = value !== undefined && value !== null;

    if (result[fullKey] === undefined && hasValue) {
      result[fullKey] = value;
    }
  });
}

/**
 * Mapea valores desde content/settings raíz hacia settingsValues profundos
 * Respetando la prioridad de los valores existentes.
 */
export const bridgeModuleContent = ({
  type,
  moduleId,
  content,
  settings,
  existingDeepValues
}: BridgeParams): Record<string, any> => {
  // Limpiar tipo si viene con sufijo _dinamico
  const baseType = type.replace('_dinamico', '');
  const adapter = MODULE_ADAPTERS[baseType];
  const result = { ...existingDeepValues };
  
  const debug = isRenderDebugEnabled();
  const originalKeys = Object.keys(result);
  let strategy: 'explicit' | 'generic-fallback' | 'explicit+fallback' = 'generic-fallback';
  let mappedKeys: string[] = [];
  let aliasesUsed: string[] = [];

  // 1. Aplicar adaptador explícito si existe
  if (adapter) {
    strategy = 'explicit+fallback';
    
    // Content Bridge
    if (content) {
      Object.entries(adapter.contentToSettings || {}).forEach(([contentPath, relativeKey]) => {
        const fullKey = `${moduleId}_${relativeKey}`;
        const value = getByPath(content, contentPath);

        // CTA deep key mapping support (handling objects like {label: "", url: ""})
        if (contentPath.includes('cta') || contentPath.includes('boton')) {
           const labelValue = getByPath(content, `${contentPath}.label`) || getByPath(content, `${contentPath}.text`) || getByPath(content, `${contentPath}.texto`);
           if (labelValue && result[fullKey] === undefined) {
             result[fullKey] = labelValue;
             mappedKeys.push(fullKey);
             aliasesUsed.push(`${contentPath}.label`);
           }
        }

        const hasValue = value !== undefined && value !== null;

        if (result[fullKey] === undefined && hasValue) {
          result[fullKey] = value;
          mappedKeys.push(fullKey);
          aliasesUsed.push(contentPath);
        }
      });
    }

    // --- Specialized Products Showcase Logic ---
    if (baseType === 'products_showcase' && content) {
       const productSource = content.products || content.productos || content.items || content.catalog || 
                            content.catalogo || content.services || content.servicios || content.offers || 
                            content.ofertas || content.paquetes || content.apps || content.soluciones || 
                            content.featured_products || content.productos_destacados || 
                            content.showcase_products || content.productos_showcase;

       if (Array.isArray(productSource) && productSource.length > 0) {
          const itemsKey = `${moduleId}_el_products_showcase_items_products`;
          const selectKey = `${moduleId}_el_products_showcase_config_select_products`;

          // Normalización compatible con Product interface
          const normalized = productSource.map((item, index) => {
            if (!item) return null;
            
            const pId = String(item.id || item.product_id || item.productId || item.sku || item.codigo || `injected_showcase_prod_${index + 1}`);
            const pName = String(item.name || item.nombre || item.title || item.titulo || item.heading || `Producto ${index + 1}`);
            const pDesc = String(item.description || item.descripcion || item.desc || item.text || item.texto || item.summary || item.resumen || '');
            
            // Price conversion logic
            let pPrice = item.price || item.precio || item.amount || item.monto || item.cost || item.costo;
            if (typeof pPrice === 'string') {
              pPrice = parseFloat(pPrice.replace(/[^\d.,-]/g, '').replace(',', '.'));
            }
            
            let pRefPrice = item.priceReference || item.old_price || item.precio_anterior || item.compare_at_price || item.before_price;
            if (typeof pRefPrice === 'string') {
               pRefPrice = parseFloat(pRefPrice.replace(/[^\d.,-]/g, '').replace(',', '.'));
            }

            const pImageUrl = item.imageUrl || item.image_url || item.image || item.imagen || item.foto || item.img || 
                             getByPath(item, 'media.url') || getByPath(item, 'image.url') || '';
            
            const pImage2Url = item.image2Url || item.image2_url || item.hover_image || item.imagen_hover || item.second_image || '';
            const pCategory = String(item.category || item.categoria || item.type || item.tipo || '');
            const pBadge = String(item.badgeText || item.badge || item.etiqueta || item.label || item.tag || '');
            
            let pStock = item.stock || item.inventario || item.available || item.disponible;
            if (typeof pStock === 'string') pStock = parseInt(pStock, 10);
            else if (typeof pStock === 'boolean') pStock = pStock ? 10 : 0;

            let pRating = item.ratingAverage || item.rating || item.calificacion;
            if (typeof pRating === 'string') pRating = parseFloat(pRating);

            let pReviews = item.reviewCount || item.reviews || item.resenas;
            if (typeof pReviews === 'string') pReviews = parseInt(pReviews, 10);

            return {
              id: pId,
              name: pName,
              description: pDesc,
              price: Number.isFinite(pPrice) ? Number(pPrice) : undefined,
              priceReference: Number.isFinite(pRefPrice) ? Number(pRefPrice) : undefined,
              imageUrl: pImageUrl,
              image2Url: pImage2Url,
              category: pCategory,
              badgeText: pBadge,
              stock: typeof pStock === 'number' ? pStock : undefined,
              ratingAverage: typeof pRating === 'number' ? pRating : undefined,
              reviewCount: typeof pReviews === 'number' ? pReviews : undefined
            };
          }).filter(Boolean);

          if (normalized.length > 0) {
            if (result[itemsKey] === undefined) {
              result[itemsKey] = normalized;
              mappedKeys.push(itemsKey);
            }
            if (result[selectKey] === undefined) {
              result[selectKey] = normalized.map(p => p!.id);
              mappedKeys.push(selectKey);
            }
          }
       }
    }

    // --- Specialized FAQ Module Logic ---
    if (baseType === 'faq' && content) {
      const itemsKey = `${moduleId}_el_faq_item_faqs`;
      const itemsSource = content.faq || content.faqs || content.preguntas || content.preguntas_frecuentes || 
                         content.questions || content.items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        result[itemsKey] = itemsSource.map((item) => {
          const q = item.question || item.pregunta || item.title || item.titulo || '';
          const a = item.answer || item.respuesta || item.description || item.descripcion || item.text || item.texto || '';
          const cat = item.category || item.categoria || 'general';
          const icon = item.icon || item.icono || '';

          return {
            question: String(q),
            answer: String(a),
            category: String(cat),
            icon: String(icon)
          };
        });
        mappedKeys.push(itemsKey);
      }
    }

    // --- Specialized Testimonials Module Logic ---
    if (baseType === 'testimonials' && content) {
      const itemsKey = `${moduleId}_el_testimonial_items_items`;
      const itemsSource = content.testimonials || content.testimonios || content.reviews || content.reseñas || 
                         content.opiniones || content.clientes || content.items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        result[itemsKey] = itemsSource.map((item, index) => {
          const text = item.text || item.texto || item.quote || item.cita || item.testimonial || 
                      item.testimonio || item.opinion || item.review || '';
          const author = item.author || item.autor || item.name || item.nombre || item.cliente || '';
          const role = item.role || item.cargo || item.puesto || item.position || '';
          const avatar = item.avatar || item.image || item.imagen || item.photo || item.foto || item.imageUrl || item.image_url || '';
          const logo = item.logo || item.company_logo || item.marca_logo || '';
          const stars = parseInt(String(item.stars || item.rating || item.calificacion || item.estrellas || 5), 10);

          return {
            id: item.id || index + 1,
            text: String(text),
            author: String(author),
            role: String(role),
            avatar: String(avatar),
            logo: String(logo),
            stars: isNaN(stars) ? 5 : stars
          };
        });
        mappedKeys.push(itemsKey);
      }
    }

    // --- Specialized Stats Module Logic ---
    if (baseType === 'stats' && content) {
      const itemsKey = `${moduleId}_el_stats_items_items`;
      const itemsSource = content.stats || content.estadisticas || content.indicadores || content.metricas || 
                         content.numbers || content.items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        result[itemsKey] = itemsSource.map((item) => {
          const value = item.value || item.valor || item.number || item.numero || item.metric || item.cifra || '';
          const label = item.label || item.etiqueta || item.title || item.titulo || item.nombre || '';
          const desc = item.description || item.descripcion || item.texto || item.resumen || '';
          const icon = item.icon || item.icono || 'Star';
          const prefix = item.prefix || '';
          const suffix = item.suffix || '';

          return {
            value: String(value),
            label: String(label),
            description: String(desc),
            icon: String(icon),
            prefix: String(prefix),
            suffix: String(suffix)
          };
        });
        mappedKeys.push(itemsKey);
      }
    }

    // --- Specialized Clients Module Logic ---
    if (baseType === 'clients' && content) {
      const itemsKey = `${moduleId}_el_clients_items_customers`;
      const selectionTouchedKey = `${moduleId}_el_client_logos_data_selection_touched`;
      const itemsSource = content.clients || content.clientes || content.logos || content.brands || 
                         content.marcas || content.partners || content.aliados || content.empresas || content.items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        result[itemsKey] = itemsSource.map((item, index) => {
          const name = item.name || item.nombre || item.company || item.empresa || item.marca || '';
          const logo = item.logo || item.image || item.imagen || item.imageUrl || item.image_url || item.logo_url || '';
          const url = item.url || item.href || item.link || item.website || item.sitio_web || '';
          const desc = item.description || item.descripcion || item.texto || item.resumen || '';

          return {
            id: item.id || `client_${index + 1}`,
            name: String(name),
            companyLogoUrl: String(logo),
            websiteUrl: String(url),
            description: String(desc)
          };
        });
        mappedKeys.push(itemsKey);
        
        // Auto-set touched flag so the component knows we have data
        result[selectionTouchedKey] = true;
        mappedKeys.push(selectionTouchedKey);
      }
    }

    // --- Specialized Team Module Logic ---
    if (baseType === 'team' && content) {
      const itemsKey = `${moduleId}_el_team_items_members`;
      const itemsSource = content.team || content.equipo || content.miembros || content.members || 
                         content.personas || content.colaboradores || content.staff || content.items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        result[itemsKey] = itemsSource.map((item, index) => {
          const name = item.name || item.nombre || item.full_name || item.nombre_completo || '';
          const role = item.role || item.cargo || item.puesto || item.position || item.titulo || '';
          const bio = item.bio || item.biography || item.biografia || item.descripcion || item.description || item.resumen || '';
          const avatar = item.avatar || item.image || item.imagen || item.photo || item.foto || item.imageUrl || item.image_url || '';
          const email = item.email || item.correo || item.correo_electronico || '';
          
          return {
            id: item.id || index + 1,
            name: String(name),
            role: String(role),
            bio: String(bio),
            image: String(avatar),
            email: String(email),
            category: String(item.category || item.categoria || 'Todos'),
            linkedin: String(item.linkedin || ''),
            twitter: String(item.twitter || ''),
            web: String(item.web || item.website || item.url || '')
          };
        });
        mappedKeys.push(itemsKey);
      }
    }

    // --- Specialized CTA Module Logic ---
    if (baseType === 'cta' && content) {
       // Button Objects
       const primaryKeyText = `${moduleId}_el_cta_actions_primary_text`;
       const primaryKeyUrl = `${moduleId}_el_cta_actions_primary_url`;
       const secondaryKeyText = `${moduleId}_el_cta_actions_secondary_text`;
       const secondaryKeyUrl = `${moduleId}_el_cta_actions_secondary_url`;

       const pCta = content.cta || content.primary || content.boton || content.primary_cta;
       const sCta = content.secondary || content.secondary_cta || content.boton_secundario;

       if (pCta && typeof pCta === 'object') {
         const label = pCta.label || pCta.text || pCta.texto || pCta.title;
         const url = pCta.url || pCta.href || pCta.link;
         if (label && result[primaryKeyText] === undefined) {
           result[primaryKeyText] = String(label);
           mappedKeys.push(primaryKeyText);
         }
         if (url && result[primaryKeyUrl] === undefined) {
           result[primaryKeyUrl] = String(url);
           mappedKeys.push(primaryKeyUrl);
         }
       }

       if (sCta && typeof sCta === 'object') {
         const label = sCta.label || sCta.text || sCta.texto || sCta.title;
         const url = sCta.url || sCta.href || sCta.link;
         if (label && result[secondaryKeyText] === undefined) {
           result[secondaryKeyText] = String(label);
           mappedKeys.push(secondaryKeyText);
         }
         if (url && result[secondaryKeyUrl] === undefined) {
           result[secondaryKeyUrl] = String(url);
           mappedKeys.push(secondaryKeyUrl);
         }
       }

       // Layout mapping
       const layoutKey = `${moduleId}_global_layout`;
       const rawLayout = content.layout || content.align || content.alignment || content.alineacion;
       if (rawLayout && result[layoutKey] === undefined) {
         if (['centered', 'split', 'bento'].includes(rawLayout)) {
           result[layoutKey] = rawLayout;
         } else if (rawLayout === 'center') {
           result[layoutKey] = 'centered';
         }
         mappedKeys.push(layoutKey);
       }
    }

    // --- Specialized Contact Module Logic ---
    if (baseType === 'contact' && content) {
      // Social Links
      const socialsKey = `${moduleId}_el_contact_info_social_links`;
      const socialsSource = content.socials || content.redes || content.redes_sociales || content.links;

      if (Array.isArray(socialsSource) && socialsSource.length > 0 && result[socialsKey] === undefined) {
        result[socialsKey] = socialsSource.map((s) => ({
          platform: String(s.platform || s.red || s.name || 'Mail'),
          url: String(s.url || s.link || s.href || '#')
        }));
        mappedKeys.push(socialsKey);
      }

      // Custom Fields
      const fieldsKey = `${moduleId}_el_contact_form_custom_fields`;
      const fieldsSource = content.fields || content.campos || content.form_fields || content.campos_formulario;

      if (Array.isArray(fieldsSource) && fieldsSource.length > 0 && result[fieldsKey] === undefined) {
        result[fieldsKey] = fieldsSource.map((f) => ({
          label: String(f.label || f.etiqueta || f.titulo || f.name || ''),
          type: String(f.type || f.tipo || 'text'),
          placeholder: String(f.placeholder || f.ayuda || ''),
          required: Boolean(f.required !== undefined ? f.required : f.requerido)
        }));
        mappedKeys.push(fieldsKey);
      }

      // Submit Button Text
      const submitKey = `${moduleId}_el_contact_form_button_text`;
      const submitSource = content.submit_text || content.submit_label || content.button_text || content.boton_texto;
      if (submitSource && result[submitKey] === undefined) {
        result[submitKey] = String(submitSource);
        mappedKeys.push(submitKey);
      }
    }

    // --- Specialized Gallery Module Logic ---
    if (baseType === 'gallery' && content) {
      const itemsKey = `${moduleId}_el_gallery_items_items`;
      const itemsSource = content.images || content.imagenes || content.imágenes || content.gallery || 
                         content.galeria || content.galería || content.photos || content.fotos || content.media || content.assets || content.items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        result[itemsKey] = itemsSource.map((item) => {
          const url = item.src || item.url || item.image || item.imagen || item.imageUrl || item.image_url || 
                     item.foto || item.photo || (item.media && item.media.url) || (item.asset && item.asset.url) || '';
          
          if (!url) return null;

          const title = item.title || item.titulo || item.name || item.nombre || '';
          const caption = item.caption || item.pie || item.pie_de_foto || item.description || item.descripcion || item.texto || '';
          const category = item.category || item.categoria || item.grupo || item.tag || 'Todos';
          const alt = item.alt || item.alt_text || item.texto_alt || title || caption || '';

          return {
            url: String(url),
            title: String(title),
            desc: String(caption),
            category: String(category),
            alt: String(alt)
          };
        }).filter(Boolean); // Filter out items with no URL
        mappedKeys.push(itemsKey);
      }
    }

    // --- Specialized Video Module Logic ---
    if (baseType === 'video' && content) {
      // Autoplay / Controls normalization to boolean
      const autoplayKey = `${moduleId}_el_video_player_autoplay`;
      const controlsKey = `${moduleId}_el_video_player_controls`;
      
      const rawAutoplay = content.autoplay || content.auto_play || content.reproduccion_automatica;
      const rawControls = content.controls || content.show_controls || content.controles;

      if (rawAutoplay !== undefined && result[autoplayKey] === undefined) {
        result[autoplayKey] = Boolean(rawAutoplay);
        mappedKeys.push(autoplayKey);
      }
      if (rawControls !== undefined && result[controlsKey] === undefined) {
        result[controlsKey] = Boolean(rawControls);
        mappedKeys.push(controlsKey);
      }

      // Aspect Ratio normalization
      const ratioKey = `${moduleId}_global_aspect_ratio`;
      const rawRatio = content.aspect_ratio || content.ratio || content.formato;
      if (rawRatio && result[ratioKey] === undefined) {
        const rString = String(rawRatio).toLowerCase();
        if (rString.includes('16/9') || rString.includes('16:9')) result[ratioKey] = '16/9';
        else if (rString.includes('9/16') || rString.includes('9:16')) result[ratioKey] = '9/16';
        else if (rString.includes('4/3') || rString.includes('4:3')) result[ratioKey] = '4/3';
        mappedKeys.push(ratioKey);
      }
    }

    // Settings Bridge
    if (settings) {
      Object.entries(adapter.settingsToDeep || {}).forEach(([settingsPath, relativeKey]) => {
        const fullKey = `${moduleId}_${relativeKey}`;
        const value = getByPath(settings, settingsPath);
        const hasValue = value !== undefined && value !== null;

        if (result[fullKey] === undefined && hasValue) {
          result[fullKey] = value;
          mappedKeys.push(fullKey);
        }
      });
    }

    // --- Specialized About Module Logic ---
    if (baseType === 'about' && content) {
      // 1. Layout value mapping
      const layoutKey = `${moduleId}_global_layout`;
      const rawLayout = settings.layout || content.layout || settings.image_position || content.image_position || content.imagePosition;
      
      if (rawLayout && result[layoutKey] === undefined) {
        if (rawLayout === 'left' || rawLayout === 'split_left') result[layoutKey] = 'split_left';
        else if (rawLayout === 'right' || rawLayout === 'split_right') result[layoutKey] = 'split_right';
        else if (rawLayout === 'centered' || rawLayout === 'center') result[layoutKey] = 'centered';
        else if (rawLayout === 'overlapping') result[layoutKey] = 'overlapping';
        mappedKeys.push(layoutKey);
      }

      // 2. Stats Normalization
      const statsKey = `${moduleId}_el_about_stats_stats_list`;
      const statsSource = content.stats || content.metrics || content.stats_list || content.numbers || content.indicators || content.indicadores;
      
      if (Array.isArray(statsSource) && statsSource.length > 0 && result[statsKey] === undefined) {
        result[statsKey] = statsSource.map(item => {
          if (typeof item === 'string') return { value: '', label: item, icon: 'Star' };
          return {
            value: String(item.value || item.numero || item.number || item.metric || item.cifra || ''),
            label: String(item.label || item.title || item.titulo || item.text || item.descripcion || ''),
            icon: String(item.icon || item.icono || 'Star')
          };
        });
        mappedKeys.push(statsKey);
      }

      // Mission/Vision Composition (if description is missing)
      const descKey = `${moduleId}_el_about_narrative_description`;
      const coreDescKeys = ['description', 'descripcion', 'subtitle', 'subtitulo', 'summary', 'resumen', 'story', 'historia'];
      const hasCoreDesc = coreDescKeys.some(k => content[k] !== undefined);
      
      if (!hasCoreDesc && result[descKey] === undefined) {
        const mision = content.mision || content.mission;
        const vision = content.vision;
        if (mision && vision) {
          result[descKey] = `Misión: ${mision}\n\nVisión: ${vision}`;
          mappedKeys.push(descKey);
          aliasesUsed.push('composition:mision+vision');
        } else if (mision) {
          result[descKey] = mision;
          mappedKeys.push(descKey);
          aliasesUsed.push('alias:mision');
        } else if (vision) {
          result[descKey] = vision;
          mappedKeys.push(descKey);
          aliasesUsed.push('alias:vision');
        }
      }
    }

    // --- Specialized Process Module Logic ---
    if (baseType === 'process' && content) {
      // 1. Steps Normalization
      const stepsKey = `${moduleId}_el_process_items_steps`;
      const stepsSource = content.steps || content.pasos || content.items || content.proceso || content.workflow || 
                         content.etapas || content.fases || content.process_steps || content.processSteps;
      
      if (Array.isArray(stepsSource) && stepsSource.length > 0 && result[stepsKey] === undefined) {
        result[stepsKey] = stepsSource.map((item, index) => {
          if (typeof item === 'string') {
            return {
              title: item,
              desc: '',
              icon: 'CheckCircle2',
              badge: `Paso ${index + 1}`
            };
          }
          
          const stepTitle = item.title || item.titulo || item.heading || item.nombre || item.name || '';
          const stepDesc = item.desc || item.description || item.descripcion || item.text || item.texto || item.summary || item.resumen || '';
          const stepIcon = item.icon || item.icono || item.lucideIcon || 'CheckCircle2';
          const stepBadge = item.badge || item.etiqueta || item.label || item.paso || item.step || item.numero || item.number || `Paso ${index + 1}`;
          const stepImage = item.image || item.image_url || item.img || item.media?.url || item.image?.url;

          return {
            title: String(stepTitle),
            desc: String(stepDesc),
            icon: String(stepIcon),
            badge: String(stepBadge),
            ...(stepImage ? { image: String(stepImage) } : {})
          };
        });
        mappedKeys.push(stepsKey);
      }

      // 2. Layout & Columns Mapping
      const layoutKey = `${moduleId}_global_layout`;
      const rawLayout = settings.layout || content.layout || content.variant || content.visual_layout;
      if (rawLayout && result[layoutKey] === undefined) {
        if (['horizontal', 'vertical', 'alternating'].includes(rawLayout)) {
          result[layoutKey] = rawLayout;
          mappedKeys.push(layoutKey);
        }
      }

      const columnsKey = `${moduleId}_global_columns`;
      const rawColumns = settings.columns || content.columns || content.columnas;
      if (rawColumns !== undefined && result[columnsKey] === undefined) {
        const colsNum = parseInt(String(rawColumns), 10);
        if (!isNaN(colsNum)) {
          result[columnsKey] = colsNum;
          mappedKeys.push(columnsKey);
        }
      }
    }

    // --- Specialized Footer Module Logic ---
  if (baseType === 'footer' && content) {
      const isDebug = isRenderDebugEnabled();
      const defaults = FOOTER_DEFAULTS;

      const isDefault = (val: any, d: string | string[]) => {
        if (Array.isArray(d)) return !val || d.includes(val);
        return !val || val === d;
      };

      if (isDebug) {
        const currentEmail = result[`${moduleId}_el_footer_contact_email`];
        console.log('[FOOTER_PROJECT_PROFILE_DEBUG]', {
          runtime: typeof window !== 'undefined' && (window as any).WEB_BUILDER_ID ? 'constructor' : 'published_viewer',
          moduleId,
          footerCurrentEmail: currentEmail,
          contentEmail: content.email || getByPath(content, 'contacto.email'),
          sourceUsed: isDefault(currentEmail, defaults.email) ? 'content_sync' : 'manual_settings'
        });
      }

      // 1. Navigation Columns Normalization
      const navKey = `${moduleId}_el_footer_nav_columns`;
      const navSource = content.columns || content.columnas || content.nav_columns || content.navigation || content.navegacion || content.enlaces || content.links;
      
      if (Array.isArray(navSource) && navSource.length > 0 && result[navKey] === undefined) {
        // Check if it's a flat list of links or proper columns
        const isFlatList = navSource.every(item => item.url || item.href || item.link);
        
        if (isFlatList) {
          result[navKey] = [{
            title: 'Enlaces',
            links: navSource.map(link => ({
              label: String(link.label || link.text || link.texto || link.title || link.titulo || link.name || link.nombre || ''),
              url: String(link.url || link.href || link.link || link.to || link.path || '#')
            }))
          }];
        } else {
          result[navKey] = navSource.map(col => ({
            title: String(col.title || col.titulo || col.label || col.nombre || col.name || ''),
            links: Array.isArray(col.links || col.enlaces || col.items || col.children || col.opciones) 
              ? (col.links || col.enlaces || col.items || col.children || col.opciones).map((link: any) => ({
                  label: String(link.label || link.text || link.texto || link.title || link.titulo || link.name || link.nombre || ''),
                  url: String(link.url || link.href || link.link || link.to || link.path || '#')
                }))
              : []
          }));
        }
        mappedKeys.push(navKey);
      }

      // 2. Social Links Normalization
      const socialKey = `${moduleId}_el_footer_social_social_links`;
      const socialSource = content.redes_sociales || content.social_links || content.socials || content.redes;
      
      // Use resolution logic if result is currently default or undefined
      if (Array.isArray(socialSource) && socialSource.length > 0) {
        const currentLinks = result[socialKey];
        const isManuallyEmpty = !currentLinks || (Array.isArray(currentLinks) && currentLinks.length === 0);
        const hasManualReal = Array.isArray(currentLinks) && currentLinks.length > 0 && currentLinks.some((s: any) => s.url && s.url !== '#' && s.url !== '');
        
        if (isManuallyEmpty || !hasManualReal) {
          result[socialKey] = socialSource.map(s => ({
            platform: s.platform || s.plataforma || '',
            icon: s.icon || getIconForPlatform(s.platform || s.plataforma || ''),
            url: s.url || normalizeSocialUrl(s.platform || s.plataforma || '', s.username || s.usuario || '#')
          }));
          mappedKeys.push(socialKey);
        }
      } else if (!result[socialKey] || (Array.isArray(result[socialKey]) && result[socialKey].length === 0)) {
        // Fallback placeholders
        result[socialKey] = [
          { platform: 'facebook', icon: 'Facebook', url: '' },
          { platform: 'instagram', icon: 'Instagram', url: '' },
          { platform: 'linkedin', icon: 'Linkedin', url: '' }
        ];
        mappedKeys.push(socialKey);
      }

      // 3. Brand Logo
      const logoKey = `${moduleId}_el_footer_brand_logo_img`;
      const logoSource = content.logo_url || getByPath(content, 'brand.logo') || getByPath(content, 'brand.logo_url');
      if (logoSource && (result[logoKey] === undefined || isDefault(result[logoKey], defaults.logos))) {
        result[logoKey] = logoSource;
        result[`${moduleId}_el_footer_brand_show_logo`] = true;
        mappedKeys.push(logoKey);
      }

      // Enrichment logic: If result has defaults, allow content to override even if not undefined
      Object.entries(adapter.contentToSettings || {}).forEach(([contentPath, relativeKey]) => {
        const fullKey = `${moduleId}_${relativeKey}`;
        const value = getByPath(content, contentPath);
        const hasValue = value !== undefined && value !== null;
        
        // Find which default to check against
        let defaultValue: string | string[] | undefined = undefined;
        if (relativeKey === 'el_footer_brand_bio') defaultValue = defaults.bio;
        else if (relativeKey === 'el_footer_contact_email') defaultValue = defaults.email;
        else if (relativeKey === 'el_footer_contact_phone') defaultValue = defaults.phone;
        else if (relativeKey === 'el_footer_contact_address') defaultValue = defaults.address;
        else if (relativeKey === 'el_footer_bottom_copyright') defaultValue = defaults.copyright;

        if (hasValue) {
          const isCurrentlyDefault = defaultValue !== undefined && isDefault(result[fullKey], defaultValue);
          if (result[fullKey] === undefined || isCurrentlyDefault) {
            result[fullKey] = value;
          }
        }
      });

      // 4. Legal Links Normalization
      const legalKey = `${moduleId}_el_footer_bottom_legal_links`;
      const legalSource = content.legal_links || content.enlaces_legales || getByPath(content, 'legal.links') || getByPath(content, 'legal.enlaces') || getByPath(content, 'bottom.legal_links');
      
      if (Array.isArray(legalSource) && legalSource.length > 0 && result[legalKey] === undefined) {
        result[legalKey] = legalSource.map(item => ({
          label: String(item.label || item.text || item.texto || item.title || item.titulo || item.name || item.nombre || ''),
          url: String(item.url || item.href || item.link || item.path || '#')
        }));
        mappedKeys.push(legalKey);
      }

      // 4. Auto-show logic
      const showLogoKey = `${moduleId}_el_footer_brand_show_logo`;
      if (result[showLogoKey] === undefined && result[`${moduleId}_el_footer_brand_logo_img`]) {
        result[showLogoKey] = true;
        mappedKeys.push(showLogoKey);
      }

      const showContactKey = `${moduleId}_el_footer_contact_show_contact`;
      if (result[showContactKey] === undefined && (
        result[`${moduleId}_el_footer_contact_address`] || 
        result[`${moduleId}_el_footer_contact_phone`] || 
        result[`${moduleId}_el_footer_contact_email`]
      )) {
        result[showContactKey] = true;
        mappedKeys.push(showContactKey);
      }

      const showNewsKey = `${moduleId}_el_footer_newsletter_show_newsletter`;
      if (result[showNewsKey] === undefined && (
        result[`${moduleId}_el_footer_newsletter_news_title`] || 
        result[`${moduleId}_el_footer_newsletter_news_desc`]
      )) {
        result[showNewsKey] = true;
        mappedKeys.push(showNewsKey);
      }
    }

    // --- Specialized Bento Module Logic ---
    if (baseType === 'bento' && content) {
      // 1. Items Normalization & Auto-Layout
      const itemsKey = `${moduleId}_el_bento_items_items`;
      const itemsSource = content.items || content.cards || content.bloques || content.blocks || 
                         content.celdas || content.cells || content.features || content.beneficios || 
                         content.soluciones || content.apps || content.recursos || content.grid_items || 
                         content.bento_items;

      if (Array.isArray(itemsSource) && itemsSource.length > 0 && result[itemsKey] === undefined) {
        const columns = parseInt(String(settings.columns || content.columns || content.layout?.columns || content.layout?.columnas || 4), 10) || 4;
        let cursorX = 0;
        let cursorY = 0;

        result[itemsKey] = itemsSource.map((item) => {
          // Normalize Item Structure
          const rawType = item.type || item.tipo || item.kind;
          let type: "text" | "image" | "icon_text" | "stat" | "cta" | "video" = "icon_text";
          
          if (rawType && ["text", "image", "icon_text", "stat", "cta", "video"].includes(rawType)) {
            type = rawType;
          } else {
            // Infer type
            if (item.button_text || item.btn_text || item.cta_text || item.cta?.label || item.boton) type = "cta";
            else if (item.image || item.image_url || item.imagen || item.img) type = "image";
            else if (item.value !== undefined || item.stat || item.metric) type = "stat";
            else if (item.icon || item.icono) type = "icon_text";
          }

          const itemTitle = item.title || item.titulo || item.heading || item.nombre || item.name || "";
          const itemDesc = item.description || item.descripcion || item.text || item.texto || item.summary || item.resumen || item.desc || "";
          const itemIcon = item.icon || item.icono || item.lucideIcon || "Sparkles";
          const itemImage = item.image || item.image_url || item.imagen || item.img || item.media?.url || item.image?.url || "";
          const itemBtnText = item.button_text || item.btn_text || item.cta_text || item.cta?.label || item.cta?.text || item.boton || item.boton_texto || "Explorar";
          const itemBtnUrl = item.btn_url || item.button_url || item.cta_url || item.cta?.url || item.cta?.href || item.url || item.href || item.link || "#";
          const itemStyle = item.card_style || item.style || item.estilo || item.variant || "solid";

          // Calculate Spans
          const col_span = Math.max(1, Math.min(columns, parseInt(String(item.col_span || item.colSpan || item.cols || item.columnas || (type === "cta" || type === "image" ? 2 : 1)), 10)));
          const row_span = Math.max(1, Math.min(8, parseInt(String(item.row_span || item.rowSpan || item.rows || item.filas || (type === "image" ? 2 : 1)), 10)));

          // Auto-Layout Logic
          let x = item.x !== undefined ? parseInt(String(item.x), 10) : -1;
          let y = item.y !== undefined ? parseInt(String(item.y), 10) : -1;

          if (x === -1 || y === -1) {
            if (cursorX + col_span > columns) {
              cursorX = 0;
              cursorY += 1;
            }
            x = cursorX;
            y = cursorY;
            cursorX += col_span;
          }

          return {
            type,
            title: String(itemTitle),
            description: String(itemDesc),
            icon: String(itemIcon),
            image: String(itemImage),
            button_text: String(itemBtnText),
            btn_url: String(itemBtnUrl),
            card_style: itemStyle,
            col_span,
            row_span,
            x,
            y
          };
        });
        
        mappedKeys.push(itemsKey);
        aliasesUsed.push('auto-layout-applied');
      }

      // 2. Global Mappings for Bento
      const gColsKey = `${moduleId}_global_columns`;
      if (result[gColsKey] === undefined) {
        const val = settings.columns || content.columns || content.layout?.columns || content.layout?.columnas;
        if (val) {
          result[gColsKey] = parseInt(String(val), 10) || 4;
          mappedKeys.push(gColsKey);
        }
      }

      const gGapKey = `${moduleId}_global_gap`;
      if (result[gGapKey] === undefined) {
        const val = settings.gap || content.gap || content.layout?.gap || content.espaciado;
        if (val) {
          result[gGapKey] = parseInt(String(val), 10) || 20;
          mappedKeys.push(gGapKey);
        }
      }

      const gBgKey = `${moduleId}_global_bg_color`;
      if (result[gBgKey] === undefined) {
        const val = settings.bg_color || content.bg_color || content.background || content.background_color;
        if (val) {
          result[gBgKey] = val;
          mappedKeys.push(gBgKey);
        }
      }

      const gDarkKey = `${moduleId}_global_dark_mode`;
      if (result[gDarkKey] === undefined) {
        const val = settings.dark_mode || content.dark_mode || content.dark || content.modo_oscuro;
        if (val !== undefined) {
          result[gDarkKey] = !!val;
          mappedKeys.push(gDarkKey);
        }
      }
    }

    // --- Specialized Products Module Logic ---
    if (baseType === 'products' && content) {
      const itemsKey = `${moduleId}_el_products_items_products`;
      const itemsSource = content.products || content.productos || content.items || 
                         content.catalog || content.catalogo || content.servicios || 
                         content.services || content.offers || content.paquetes || 
                         content.inventario;

      if (Array.isArray(itemsSource) && result[itemsKey] === undefined) {
        // [SIP v12.6] Even if empty, we MUST set it as [] to satisfy hydration checks
        // as long as the source effectively arrived as an array
        result[itemsKey] = itemsSource.map((item, index) => {
          const generatedId = item.id || item.product_id || item.productId || item.sku || item.codigo || `injected_product_${moduleId}_${index + 1}`;
          
          // Normalización de Precio
          let normalizedPrice = undefined;
          const rawPrice = item.price ?? item.precio ?? item.amount ?? item.monto ?? item.cost ?? item.costo;
          if (typeof rawPrice === 'number') {
            normalizedPrice = rawPrice;
          } else if (typeof rawPrice === 'string') {
            const cleanStr = rawPrice.replace(/[^\d.,-]/g, '').replace(',', '.');
            const parsed = parseFloat(cleanStr);
            if (!isNaN(parsed)) normalizedPrice = parsed;
          }

          // Normalización de Stock
          let normalizedStock = undefined;
          const rawStock = item.stock ?? item.inventario ?? item.available ?? item.disponible;
          if (typeof rawStock === 'number') normalizedStock = rawStock;
          else if (typeof rawStock === 'string') {
            const parsed = parseInt(rawStock, 10);
            if (!isNaN(parsed)) normalizedStock = parsed;
          } else if (typeof rawStock === 'boolean') {
            normalizedStock = rawStock ? 1 : 0;
          }

          return {
            id: String(generatedId),
            name: String(item.name || item.nombre || item.title || item.titulo || item.heading || 'Producto sin nombre'),
            description: String(item.description || item.descripcion || item.desc || item.text || item.texto || item.summary || item.resumen || ''),
            price: normalizedPrice,
            priceReference: typeof (item.priceReference ?? item.old_price ?? item.precio_anterior ?? item.compare_at_price ?? item.before_price) === 'number' 
              ? (item.priceReference ?? item.old_price ?? item.precio_anterior ?? item.compare_at_price ?? item.before_price)
              : undefined,
            category: String(item.category || item.categoria || item.type || item.tipo || ''),
            imageUrl: String(item.imageUrl || item.image_url || item.image || item.imagen || item.foto || item.img || item.media?.url || item.image?.url || ''),
            image2Url: String(item.image2Url || item.image2_url || item.hover_image || item.imagen_hover || item.second_image || ''),
            badgeText: String(item.badgeText || item.badge || item.etiqueta || item.label || item.tag || ''),
            stock: normalizedStock,
            ratingAverage: parseFloat(String(item.ratingAverage || item.rating || item.calificacion || 5)),
            reviewCount: parseInt(String(item.reviewCount || item.reviews || item.resenas || 0), 10)
          };
        });
        
        mappedKeys.push(itemsKey);
        
        // Auto-set selection_mode if items are injected
        const selectionModeKey = `${moduleId}_el_products_config_selection_mode`;
        const selectProductsKey = `${moduleId}_el_products_config_select_products`;
        
        if (result[selectionModeKey] === undefined) {
          result[selectionModeKey] = 'manual';
          mappedKeys.push(selectionModeKey);
        }

        // Si es manual, debemos asegurarnos de que los IDs inyectados estén seleccionados
        if (result[selectionModeKey] === 'manual' && (!result[selectProductsKey] || result[selectProductsKey].length === 0)) {
          result[selectProductsKey] = result[itemsKey].map((p: any) => p.id);
          mappedKeys.push(selectProductsKey);
        }
      }
    }
  }

  if (baseType === 'hero' && content) {
    const titleModeKey = `${moduleId}_el_hero_typography_title_mode`;
    const rotatingEnabledKey = `${moduleId}_el_hero_typography_rotating_enabled`;
    const resolvedTitleMode =
      content.title_mode === 'dynamic' || content.title_mode === 'static'
        ? content.title_mode
        : content.is_rotating_active === true
          ? 'dynamic'
          : undefined;

    if (resolvedTitleMode && result[titleModeKey] === undefined) {
      result[titleModeKey] = resolvedTitleMode;
      mappedKeys.push(titleModeKey);
    }

    if (result[rotatingEnabledKey] === undefined && resolvedTitleMode) {
      result[rotatingEnabledKey] = resolvedTitleMode === 'dynamic';
      mappedKeys.push(rotatingEnabledKey);
    }
  }

  // 2. Aplicar Fallback Genérico (asegura que keys como 'title' lleguen como 'mod_123_title')
  applyGenericFallback(moduleId, content, result);
  applyGenericFallback(moduleId, settings, result);

  if (debug) {
    const finalKeys = Object.keys(result);
    const addedKeys = finalKeys.filter(k => !originalKeys.includes(k));
    
    logDebug('[HYDRATION_BRIDGE_DEBUG]', {
      moduleId,
      moduleType: type,
      baseType,
      strategy,
      adapter: baseType,
      mappedKeys,
      aliasesUsed,
      columnsCount: baseType === 'footer' ? (result[`${moduleId}_el_footer_nav_columns`]?.length || 0) : 0,
      socialLinksCount: baseType === 'footer' ? (result[`${moduleId}_el_footer_social_social_links`]?.length || 0) : 0,
      legalLinksCount: baseType === 'footer' ? (result[`${moduleId}_el_footer_bottom_legal_links`]?.length || 0) : 0,
      contactDetected: baseType === 'footer' ? Boolean(result[`${moduleId}_el_footer_contact_show_contact`]) : false,
      newsletterDetected: baseType === 'footer' ? Boolean(result[`${moduleId}_el_footer_newsletter_show_newsletter`]) : false,
      logoDetected: baseType === 'footer' ? Boolean(result[`${moduleId}_el_footer_brand_logo_img`]) : false,
      stepsCount: baseType === 'process' ? (result[`${moduleId}_el_process_items_steps`]?.length || 0) : 0,
      layoutDetected: baseType === 'process' ? result[`${moduleId}_global_layout`] : undefined,
      statsCount: baseType === 'about' ? (result[`${moduleId}_el_about_stats_stats_list`]?.length || 0) : 0,
      ctaDetected: Boolean(result[`${moduleId}_el_about_narrative_button_text`]),
      imageDetected: Boolean(result[`${moduleId}_el_about_visual_image_url`]),
      bentoItemsCount: baseType === 'bento' ? (result[`${moduleId}_el_bento_items_items`]?.length || 0) : 0,
      bentoAutoLayout: baseType === 'bento' && aliasesUsed.includes('auto-layout-applied'),
      injectedProductsCount: baseType === 'products' ? (result[`${moduleId}_el_products_items_products`]?.length || 0) : 0,
      selectionMode: baseType === 'products' ? result[`${moduleId}_el_products_config_selection_mode`] : undefined,
      layout: baseType === 'products' ? result[`${moduleId}_global_layout`] : undefined,
      columns: baseType === 'products' ? result[`${moduleId}_global_columns`] : undefined,
      originalContentKeys: content ? Object.keys(content) : [],
      addedKeys,
      totalKeys: finalKeys.length
    });
  }

  if (debug) {
    logDebug('HYDRATION_BRIDGE_DEBUG', {
      moduleId,
      moduleType: baseType,
      strategy,
      adapter: adapter ? baseType : 'none',
      mappedKeysCount: mappedKeys.length,
      mappedKeys,
      aliasesUsed,
      layout: result[`${moduleId}_global_layout`],
      columns: result[`${moduleId}_global_columns`]
    });
  }

  return result;
};

