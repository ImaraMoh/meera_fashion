import { Product, SelectionItem } from '../types';

export const generateWhatsAppSingleProductMessage = (
  product: Product,
  optionsOrSize?: string | { selectedSize?: string; selectedVariant?: string; customNote?: string },
  selectedVariant?: string,
  brandName: string = "Meera's Fashion",
  currencySymbol: string = "£"
): string => {
  let size: string | undefined;
  let variant: string | undefined;
  let customNote: string | undefined;

  if (typeof optionsOrSize === 'object' && optionsOrSize !== null) {
    size = optionsOrSize.selectedSize;
    variant = optionsOrSize.selectedVariant;
    customNote = optionsOrSize.customNote;
  } else if (typeof optionsOrSize === 'string') {
    size = optionsOrSize;
    variant = selectedVariant;
  }

  const lines: string[] = [
    `🌸 *Enquiry from ${brandName}* 🌸`,
    '',
    `Hello ${brandName}, I am interested in:`,
    `✨ *${product.name}*`,
    `🏷️ Price: ${currencySymbol}${product.price}${product.originalPrice ? ` (was ${currencySymbol}${product.originalPrice})` : ''}`,
    `📦 Status: ${product.isPreOrder ? 'Pre-Order' : product.stockStatus}`,
  ];

  if (size) {
    lines.push(`📏 Size / Variant: ${size}`);
  } else if (variant) {
    lines.push(`📏 Variant: ${variant}`);
  }

  if (customNote) {
    lines.push(`📝 Note: ${customNote}`);
  }

  lines.push('');
  lines.push('Could you please provide more details on availability, sizing, and delivery timeframe?');
  lines.push('');
  lines.push('Thank you! 💖');

  return lines.join('\n');
};

export const generateWhatsAppSelectionMessage = (
  items: SelectionItem[],
  customerDetails?: { name?: string; phone?: string; notes?: string },
  brandName: string = "Meera's Fashion",
  currencySymbol: string = "£"
): string => {
  const lines: string[] = [
    `🌸 *New Order Enquiry - ${brandName}* 🌸`,
    '',
    `Hello ${brandName},`,
    'I would like to order / enquire about the following items:',
    '',
  ];

  let total = 0;

  items.forEach((item, index) => {
    const itemTotal = item.unitPrice * item.quantity;
    total += itemTotal;

    lines.push(`${index + 1}. *${item.product.name}*`);
    if (item.selectedSize) {
      lines.push(`   • Size: ${item.selectedSize}`);
    }
    if (item.selectedVariant) {
      const varStr = Object.entries(item.selectedVariant)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      lines.push(`   • Option: ${varStr}`);
    }
    lines.push(`   • Price: ${currencySymbol}${item.unitPrice} x ${item.quantity} = ${currencySymbol}${itemTotal}`);
    if (item.product.isPreOrder) {
      lines.push(`   • [Pre-Order Request]`);
    }
    lines.push('');
  });

  lines.push('----------------------------------');
  lines.push(`💰 *Estimated Total: ${currencySymbol}${total.toFixed(2)}*`);
  lines.push('----------------------------------');

  if (customerDetails?.name) {
    lines.push(`👤 Customer Name: ${customerDetails.name}`);
  }
  if (customerDetails?.phone) {
    lines.push(`📞 Contact: ${customerDetails.phone}`);
  }
  if (customerDetails?.notes) {
    lines.push(`📝 Special Notes: ${customerDetails.notes}`);
  }

  lines.push('');
  lines.push('Please confirm availability, payment details, and UK / International delivery options.');
  lines.push('Thank you! 🌸');

  return lines.join('\n');
};

export const getWhatsAppLink = (whatsappNumber: string, message: string): string => {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
};

export const openWhatsAppChat = (
  whatsappNumber: string,
  message: string
) => {
  const link = getWhatsAppLink(
    whatsappNumber,
    message
  );

  /*
   * Mobile browsers are more likely to block
   * window.open() after an async operation.
   *
   * Use direct navigation on mobile so the
   * WhatsApp deep link is handled by the OS.
   */
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    window.location.href = link;
    return;
  }

  /*
   * Desktop:
   * Keep opening WhatsApp in a new tab.
   */
  window.open(
    link,
    '_blank',
    'noopener,noreferrer'
  );
};
