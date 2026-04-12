import type { Friend } from '../types';
import { buildFallbackEmailDisplay } from './buildFallbackEmailDisplay';
import { shortenFriendAddress } from './shortenFriendAddress';

/** Approx. chars that fit the value column on the narrowest Friends card (14px, ~200px cell). */
const ADDRESS_MAX_LEN = 34;

export interface FriendContactRows {
  emailText: string;
  emailHref: string | null;
  addressText: string;
  addressHref: string | null;
  phoneText: string;
  phoneHref: string | null;
}

/**
 * Always-three-row contact data. Email/phone fallbacks per product rules; address shortened in JS.
 */
export const buildFriendContactRows = (friend: Friend): FriendContactRows => {
  const emailRaw = friend.email?.trim();
  const phoneRaw = friend.phone?.trim();
  const addressRaw = friend.address?.trim();
  const addressUrl = friend.addressUrl?.trim();

  const emailText = emailRaw ?? buildFallbackEmailDisplay(friend.title ?? '');
  const emailHref = emailRaw ? `mailto:${emailRaw}` : null;

  let addressText: string;
  if (addressRaw) {
    addressText = shortenFriendAddress(addressRaw, ADDRESS_MAX_LEN);
    if (!addressText) {
      addressText = 'website only';
    }
  } else {
    addressText = 'website only';
  }

  const addressHref = addressUrl || null;

  const phoneText = phoneRaw ?? 'email only';
  const phoneHref = phoneRaw ? `tel:${phoneRaw.replace(/\s/g, '')}` : null;

  return {
    emailText,
    emailHref,
    addressText,
    addressHref,
    phoneText,
    phoneHref,
  };
};
