import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { WhatsAppOrdersCatalogCustomOrder } from './whatsappOrdersCatalogOrganizer';
import {
  applyCustomOrderToCatalogGroups,
  groupProductsByCategory,
  moveCategoryInCustomOrder,
  moveProductInCustomOrder,
  normalizeCatalogCategories,
  normalizeCatalogProducts,
  reconcileWhatsAppOrdersCustomOrder
} from './whatsappOrdersCatalogOrganizer';

type WhatsAppOrdersCatalogOrganizerControlProps = {
  categories: unknown;
  products: unknown;
  order: WhatsAppOrdersCatalogCustomOrder;
  onOrderChange: (order: WhatsAppOrdersCatalogCustomOrder) => void;
  disabled?: boolean;
};

const MoveButton: React.FC<{
  direction: 'up' | 'down';
  label: string;
  disabled: boolean;
  onClick: () => void;
}> = ({ direction, label, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-surface text-text/60 transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-35"
  >
    {direction === 'up' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
  </button>
);

/**
 * Purely presentational control. It reconciles the visible tree but delegates
 * persistence to its parent, so rendering never changes editor settings.
 */
export const WhatsAppOrdersCatalogOrganizerControl: React.FC<WhatsAppOrdersCatalogOrganizerControlProps> = ({
  categories,
  products,
  order,
  onOrderChange,
  disabled = false
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(() => new Set());
  const reconciledOrder = React.useMemo(
    () => reconcileWhatsAppOrdersCustomOrder(
      normalizeCatalogCategories(categories),
      normalizeCatalogProducts(products),
      order
    ),
    [categories, order, products]
  );
  const groups = React.useMemo(
    () => applyCustomOrderToCatalogGroups(
      groupProductsByCategory(normalizeCatalogCategories(categories), normalizeCatalogProducts(products)),
      reconciledOrder
    ),
    [categories, products, reconciledOrder]
  );

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const nextOrder = moveCategoryInCustomOrder(reconciledOrder, categoryId, direction);
    if (nextOrder !== reconciledOrder) onOrderChange(nextOrder);
  };

  const moveProduct = (categoryId: string, productId: string, direction: 'up' | 'down') => {
    const nextOrder = moveProductInCustomOrder(reconciledOrder, categoryId, productId, direction);
    if (nextOrder !== reconciledOrder) onOrderChange(nextOrder);
  };

  if (groups.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border/60 bg-surface px-3 py-2 text-[10px] leading-relaxed text-text/55">
        No hay categorías ni productos disponibles para organizar.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-border/50 bg-surface p-2.5">
      <p className="px-0.5 text-[10px] leading-relaxed text-text/55">
        Usa las flechas para cambiar el orden de categorías y productos.
      </p>
      <div className="space-y-2" role="tree" aria-label="Organizador del catálogo">
        {groups.map((group, groupIndex) => (
          <div key={group.category.id} role="treeitem" aria-level={1} className="rounded-md border border-border/40 bg-background/40">
            <div className="flex min-w-0 items-center gap-2 px-2 py-2">
              <button
                type="button"
                aria-expanded={expandedCategories.has(group.category.id)}
                aria-controls={`catalog-order-${group.category.id}`}
                onClick={() => setExpandedCategories((current) => {
                  const next = new Set(current);
                  if (next.has(group.category.id)) next.delete(group.category.id); else next.add(group.category.id);
                  return next;
                })}
                className="rounded p-1 text-text/50 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <ChevronDown size={14} className={expandedCategories.has(group.category.id) ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-text" title={group.category.name}>
                {group.category.name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <MoveButton
                  direction="up"
                  label={`Subir categoría ${group.category.name}`}
                  disabled={disabled || groupIndex === 0}
                  onClick={() => moveCategory(group.category.id, 'up')}
                />
                <MoveButton
                  direction="down"
                  label={`Bajar categoría ${group.category.name}`}
                  disabled={disabled || groupIndex === groups.length - 1}
                  onClick={() => moveCategory(group.category.id, 'down')}
                />
              </div>
            </div>
            {expandedCategories.has(group.category.id) && <div id={`catalog-order-${group.category.id}`} className="border-t border-border/30 px-2 py-1.5">
              {group.products.length === 0 ? (
                <p className="py-1 pl-3 text-[10px] italic text-text/45">Sin productos</p>
              ) : (
                <div className="space-y-1" role="group">
                  {group.products.map((product, productIndex) => (
                    <div key={product.id} role="treeitem" aria-level={2} className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/35">
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-text/75" title={product.name}>
                        {product.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <MoveButton
                          direction="up"
                          label={`Subir producto ${product.name}`}
                          disabled={disabled || productIndex === 0}
                          onClick={() => moveProduct(group.category.id, product.id, 'up')}
                        />
                        <MoveButton
                          direction="down"
                          label={`Bajar producto ${product.name}`}
                          disabled={disabled || productIndex === group.products.length - 1}
                          onClick={() => moveProduct(group.category.id, product.id, 'down')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
};
