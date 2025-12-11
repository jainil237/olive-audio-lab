import React, { useMemo, useState } from 'react';
import PaymentDialog from '../components/PaymentDialog.jsx';
import SongCard from '../components/SongCard.jsx';
import SongStreamingDialog from '../components/SongStreamingDialog.jsx';
import { AppButton, GlassCard, SectionHeading } from '../components/ui/primitives.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const CartPage = () => {
  const { items, removeItem, total, recordInvoice, billingHistory, removeInvoice } = useCart();
  const { songs } = useCatalog();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [streamSong, setStreamSong] = useState(null);

  const recommendations = useMemo(
    () => songs.filter((song) => !items.find((item) => item.id === song.id)).slice(0, 3),
    [songs, items],
  );

  const handlePaymentSuccess = (payload) => {
    const invoice = {
      amount: payload.amount,
      gateway: payload.gateway,
      status: payload.status,
      reference: payload.reference,
      customer: payload.customer,
      items,
    };

    recordInvoice(invoice);
    setLastInvoice(invoice);
  };

  return (
    <div className="space-y-14 text-white">
      <section className="space-y-4">
        <SectionHeading align="left" eyebrow="Checkout">
          Cart & Billing
        </SectionHeading>
        <p className="text-zinc-400 max-w-2xl">
          Secure your project slot with Stripe or Razorpay. After payment we’ll send contracts and project logistics to your inbox.
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <GlassCard className="bg-black/50 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Order summary</h3>
            <span className="text-sm text-zinc-500">{items.length} item{items.length === 1 ? '' : 's'}</span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Your cart is empty. Add licenses from the catalogue to begin checkout.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div>
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    <p className="text-xs text-zinc-500">{item.artist}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] mt-1">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AppButton variant="ghost" className="text-sm" onClick={() => setStreamSong(item)}>
                      Preview links
                    </AppButton>
                    <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                    <AppButton variant="ghost" className="text-red-400 hover:text-red-200" onClick={() => removeItem(item.id)}>
                      Remove
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-white/10 pt-4">
            <div className="text-sm text-zinc-500">
              Taxes and additional services will be calculated in the final proposal.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold">${total.toFixed(2)}</span>
              <AppButton variant="primary" onClick={() => setPaymentOpen(true)} disabled={items.length === 0}>
                Proceed to payment
              </AppButton>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="bg-black/50 space-y-4">
            <h3 className="text-xl font-semibold">Billing history</h3>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
              {billingHistory.length === 0 && (
                <p className="text-sm text-zinc-500">Complete a payment to generate your first invoice.</p>
              )}
              {billingHistory.map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{new Date(invoice.createdAt).toLocaleString()}</span>
                    <span>{invoice.gateway}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    ${invoice.amount.toFixed(2)} — {invoice.status}
                  </p>
                  {invoice.reference && <p className="text-xs text-zinc-500">Ref: {invoice.reference}</p>}
                  {invoice.customer && (
                    <p className="text-xs text-zinc-500">
                      {invoice.customer.name} · {invoice.customer.email}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <AppButton variant="ghost" className="text-xs" onClick={() => setStreamSong(invoice.items?.[0])}>
                      View item
                    </AppButton>
                    <AppButton variant="ghost" className="text-xs text-red-400 hover:text-red-200" onClick={() => removeInvoice(invoice.id)}>
                      Delete
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {lastInvoice && (
            <GlassCard className="bg-lime-500/10 border-lime-400/40 text-lime-100">
              Payment recorded with {lastInvoice.gateway}. Invoice reference {lastInvoice.reference}.
            </GlassCard>
          )}

          {recommendations.length > 0 && (
            <GlassCard className="bg-black/50 space-y-4">
              <h3 className="text-xl font-semibold">You may also like</h3>
              <div className="grid gap-4">
                {recommendations.map((song) => (
                  <SongCard key={song.id} song={song} onAdd={() => {}} onOpenStreams={setStreamSong} />
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={total}
        onSuccess={handlePaymentSuccess}
      />

      <SongStreamingDialog open={!!streamSong} onClose={() => setStreamSong(null)} song={streamSong} />
    </div>
  );
};

export default CartPage;
